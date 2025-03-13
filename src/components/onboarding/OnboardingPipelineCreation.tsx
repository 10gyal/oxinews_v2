"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOnboarding } from "@/components/providers/OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, HelpCircle, Loader2 } from "lucide-react";
import { createPipeline } from "@/components/pipeline/utils/api";

// Define the steps for pipeline creation
const pipelineSteps = [
  {
    title: "Basic Information",
    description: "Give your pipeline a name and define what content you're interested in."
  },
  {
    title: "Content Sources",
    description: "Select where you want to get your content from."
  },
  {
    title: "Delivery Settings",
    description: "Choose how and when you want to receive your content."
  }
];

export function OnboardingPipelineCreation() {
  const { user } = useAuth();
  const { nextStep, setPipelineCreated } = useOnboarding();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [pipelineName, setPipelineName] = useState("My First Pipeline");
  const [focus, setFocus] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [subreddit, setSubreddit] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleNext = () => {
    // Validate current step
    if (currentStep === 0 && !validateBasicInfo()) {
      return;
    }
    
    if (currentStep === 1 && !validateSources()) {
      return;
    }
    
    if (currentStep === 2) {
      handleSubmit();
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const validateBasicInfo = () => {
    if (!pipelineName.trim()) {
      setError("Pipeline name is required");
      return false;
    }
    
    if (!focus.trim()) {
      setError("Focus is required");
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const validateSources = () => {
    if (!subreddit.trim()) {
      setError("At least one subreddit is required");
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to create a pipeline");
      return;
    }
    
    if (!email.trim()) {
      setError("Email is required for delivery");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const pipelineData = {
        pipeline_name: pipelineName,
        focus,
        schedule,
        delivery_time: deliveryTime,
        is_active: true,
        delivery_email: [email],
        subreddits: [subreddit],
        source: []
      };
      
      const result = await createPipeline(user.id, pipelineData);
      
      if (result.error) {
        setError(result.error.message);
        setIsSubmitting(false);
        return;
      }
      
      // Mark pipeline as created in onboarding context
      setPipelineCreated(true);
      
      // Move to next onboarding step
      nextStep();
    } catch (err) {
      console.error("Error creating pipeline:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create pipeline";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };
  
  // Render different form steps based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="pipeline-name">Pipeline Name</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Give your pipeline a descriptive name to help you identify it later.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="pipeline-name"
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="My Tech News"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="focus">Content Focus</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Describe what kind of content you&apos;re interested in. Be specific for better results.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="E.g., Latest developments in AI and machine learning, focusing on practical applications and research breakthroughs."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="subreddit">Subreddit</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Enter a subreddit name without the &apos;r/&apos; prefix. This will be your content source.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="subreddit"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                placeholder="technology"
              />
              <p className="text-xs text-muted-foreground">
                Enter a subreddit name (e.g., &apos;technology&apos;, &apos;science&apos;, &apos;worldnews&apos;)
              </p>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="schedule">Delivery Schedule</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">How often you want to receive content from this pipeline.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="delivery-time">Delivery Time</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">What time of day you want to receive your content.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="delivery-time"
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="email">Delivery Email</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-2">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-60">Where you want to receive your curated content.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Your First Pipeline</h2>
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {pipelineSteps.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / pipelineSteps.length) * 100}%` }}
        />
      </div>
      
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="pb-2">
          <h3 className="text-xl font-bold">{pipelineSteps[currentStep].title}</h3>
          <p className="text-muted-foreground">
            {pipelineSteps[currentStep].description}
          </p>
        </CardHeader>
        
        <CardContent className="pb-2">
          {renderStepContent()}
          
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : currentStep < pipelineSteps.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Create Pipeline
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
