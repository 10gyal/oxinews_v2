"use client";

import { useState } from "react";
import { useOnboarding } from "@/components/providers/OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, FileText, Clock, Zap } from "lucide-react";

// Define the slides for the introduction
const introSlides = [
  {
    title: "What are Pipelines?",
    description: "Pipelines deliver personalized content directly to you based on your interests and preferences.",
    icon: <FileText className="h-12 w-12 text-primary" />,
    details: "Think of pipelines as your personal content curators. They continuously scan sources you care about and deliver only the most relevant information to you."
  },
  {
    title: "How it Works",
    description: "Select your topics, choose your sources, and set your delivery schedule.",
    icon: <Clock className="h-12 w-12 text-primary" />,
    details: "OxiNews handles the heavy lifting. Our AI analyzes content from your selected sources, filters out the noise, and delivers concise summaries on your schedule."
  },
  {
    title: "Benefits",
    description: "Save time, stay informed, and never miss important content in your areas of interest.",
    icon: <Zap className="h-12 w-12 text-primary" />,
    details: "No more endless scrolling or information overload. With OxiNews, you get exactly what you need, when you need it, all in one place."
  }
];

export function OnboardingIntroduction() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { nextStep } = useOnboarding();
  
  const handleNext = () => {
    if (currentSlide < introSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      nextStep();
    }
  };
  
  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = introSlides[currentSlide];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Platform Introduction</h2>
        <div className="text-sm text-muted-foreground">
          Step {currentSlide + 1} of {introSlides.length}
        </div>
      </div>
      
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-primary/10 p-4 rounded-full">
            {slide.icon}
          </div>
          <h3 className="text-2xl font-bold">{slide.title}</h3>
          <p className="text-muted-foreground mt-2">
            {slide.description}
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-4 pb-2">
          <div className="bg-muted rounded-lg p-6 my-4">
            <p className="text-lg">
              {slide.details}
            </p>
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 py-4">
            {introSlides.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentSlide === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button onClick={handleNext}>
            {currentSlide < introSlides.length - 1 ? (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
