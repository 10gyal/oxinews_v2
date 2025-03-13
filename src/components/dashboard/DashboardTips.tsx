"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface DashboardTipsProps {
  userId: string;
}

export function DashboardTips({ userId }: DashboardTipsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const router = useRouter();
  
  // Tips to show to new users
  const tips = [
    {
      title: "Create Multiple Pipelines",
      description: "You can create different pipelines for different interests. Try creating a pipeline for work, hobbies, or news.",
      action: "Create Another Pipeline",
      actionPath: "/dashboard/create-pipeline"
    },
    {
      title: "Explore Popular Content",
      description: "Check out what other users are reading. You might discover interesting topics you hadn't considered.",
      action: "Explore Popular",
      actionPath: "/popular"
    },
    {
      title: "Customize Your Schedule",
      description: "You can change when and how often you receive content. Daily, weekly, or monthly - it's up to you.",
      action: "Edit Pipeline",
      actionPath: "/dashboard"
    }
  ];
  
  // Check if user has recently completed onboarding
  useEffect(() => {
    const checkRecentOnboarding = async () => {
      try {
        const { data, error } = await supabase
          .from('user_metadata')
          .select('onboarding_completed, updated_at')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error("Error checking onboarding status:", error);
          return;
        }
        
        if (data && data.onboarding_completed) {
          // Check if onboarding was completed recently (within the last hour)
          const updatedAt = new Date(data.updated_at);
          const oneHourAgo = new Date();
          oneHourAgo.setHours(oneHourAgo.getHours() - 1);
          
          if (updatedAt > oneHourAgo) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Error in checkRecentOnboarding:", error);
      }
    };
    
    checkRecentOnboarding();
  }, [userId]);
  
  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  const handleNextTip = () => {
    if (currentTipIndex < tips.length - 1) {
      setCurrentTipIndex(currentTipIndex + 1);
    } else {
      setIsVisible(false);
    }
  };
  
  const handleAction = () => {
    router.push(tips[currentTipIndex].actionPath);
  };
  
  if (!isVisible) {
    return null;
  }
  
  const currentTip = tips[currentTipIndex];

  return (
    <Card className="mb-6 border-2 border-primary/10 shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{currentTip.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTip.description}
              </p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDismiss}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-1">
            {tips.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-6 rounded-full ${
                  index === currentTipIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNextTip}
            >
              {currentTipIndex < tips.length - 1 ? "Next Tip" : "Dismiss"}
              {currentTipIndex < tips.length - 1 && (
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              )}
            </Button>
            
            <Button 
              size="sm" 
              onClick={handleAction}
            >
              {currentTip.action}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
