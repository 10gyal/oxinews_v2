"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useOnboarding } from "@/components/providers/OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ThemeLogo } from "@/components/layout/ThemeLogo";
import { ArrowRight } from "lucide-react";

export function OnboardingWelcome() {
  const { user } = useAuth();
  const { nextStep, skipOnboarding } = useOnboarding();
  
  // Extract user's name from metadata or email
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <Card className="border-2 border-primary/10 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4">
          <ThemeLogo width={60} height={60} />
        </div>
        <h1 className="text-3xl font-bold">Welcome to OxiNews, {formattedName}!</h1>
        <p className="text-muted-foreground mt-2">
          We&apos;re excited to help you discover and curate content that matters to you.
        </p>
      </CardHeader>
      
      <CardContent className="text-center space-y-4 pb-2">
        <div className="bg-primary/5 rounded-lg p-6 my-6">
          <p className="text-lg">
            OxiNews helps you stay informed with personalized content delivered on your schedule.
            Let&apos;s set up your first content pipeline in just a few steps.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={nextStep}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          className="text-muted-foreground" 
          onClick={skipOnboarding}
        >
          Skip Onboarding
        </Button>
      </CardFooter>
    </Card>
  );
}
