"use client";

import { useOnboarding } from "@/components/providers/OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingSuccess() {
  const { completeOnboarding } = useOnboarding();
  const router = useRouter();
  
  const handleExplorePopular = () => {
    router.push("/popular");
  };
  
  const handleGoToDashboard = () => {
    completeOnboarding();
  };

  return (
    <Card className="border-2 border-primary/10 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
        </div>
        <h1 className="text-3xl font-bold">Success!</h1>
        <p className="text-muted-foreground mt-2">
          Your first pipeline has been created successfully.
        </p>
      </CardHeader>
      
      <CardContent className="text-center space-y-4 pb-2">
        <div className="bg-muted rounded-lg p-6 my-6">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-medium">What happens next?</h3>
          </div>
          <p className="text-lg mb-4">
            Your first content delivery will arrive in your inbox at your scheduled time.
          </p>
          <div className="text-left space-y-2 text-sm">
            <p className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
              <span>Our system will scan your selected sources for relevant content</span>
            </p>
            <p className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
              <span>Content will be analyzed and curated based on your focus</span>
            </p>
            <p className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full h-5 w-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
              <span>A personalized digest will be delivered to your email</span>
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleGoToDashboard}
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleExplorePopular}
        >
          Explore Popular Content
        </Button>
      </CardFooter>
    </Card>
  );
}
