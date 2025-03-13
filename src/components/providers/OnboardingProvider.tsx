"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

// Define onboarding state types
type OnboardingStep = 'welcome' | 'introduction' | 'pipeline-creation' | 'success' | 'completed';

type OnboardingContextType = {
  // Onboarding state
  isOnboarding: boolean;
  currentStep: OnboardingStep;
  
  // Onboarding actions
  startOnboarding: () => void;
  completeOnboarding: () => Promise<void>;
  nextStep: () => void;
  skipOnboarding: () => Promise<void>;
  
  // Step-specific state
  pipelineCreated: boolean;
  setPipelineCreated: (created: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  // Onboarding state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [pipelineCreated, setPipelineCreated] = useState(false);
  
  // Auth context
  const { user, status } = useAuth();
  const router = useRouter();

  // Mark onboarding as completed in the database
  const completeOnboardingInDb = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check if record exists
      const { data, error: checkError } = await supabase
        .from('user_metadata')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking user metadata:", checkError);
        return;
      }
      
      if (data) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_metadata')
          .update({ onboarding_completed: true })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error("Error updating onboarding status:", updateError);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_metadata')
          .insert({ user_id: user.id, onboarding_completed: true });
        
        if (insertError) {
          console.error("Error inserting onboarding status:", insertError);
        }
      }
    } catch (error) {
      console.error("Error in completeOnboardingInDb:", error);
    }
  }, [user]);

  // Check if user is new and should see onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status !== 'authenticated' || !user) return;
      
      try {
        // Check if user has completed onboarding
        const { data, error } = await supabase
          .from('user_metadata')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error("Error checking onboarding status:", error);
          return;
        }
        
        // If no data or onboarding not completed, user should see onboarding
        const shouldSeeOnboarding = !data || data.onboarding_completed !== true;
        
        if (shouldSeeOnboarding) {
          // Check if user already has pipelines
          const { data: pipelines, error: pipelinesError } = await supabase
            .from('pipeline_configs')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (pipelinesError) {
            console.error("Error checking user pipelines:", pipelinesError);
            return;
          }
          
          // If user already has pipelines, mark onboarding as completed
          if (pipelines && pipelines.length > 0) {
            await completeOnboardingInDb();
            return;
          }
          
          // Otherwise, start onboarding
          setIsOnboarding(true);
          setCurrentStep('welcome');
          router.push('/onboarding');
        }
      } catch (error) {
        console.error("Error in checkOnboardingStatus:", error);
      }
    };
    
    checkOnboardingStatus();
  }, [user, status, router, completeOnboardingInDb]);

  // Onboarding actions
  const startOnboarding = useCallback(() => {
    setIsOnboarding(true);
    setCurrentStep('welcome');
    router.push('/onboarding');
  }, [router]);

  const completeOnboarding = useCallback(async () => {
    await completeOnboardingInDb();
    setIsOnboarding(false);
    setCurrentStep('completed');
    router.push('/dashboard');
  }, [completeOnboardingInDb, router]);

  const skipOnboarding = useCallback(async () => {
    await completeOnboardingInDb();
    setIsOnboarding(false);
    setCurrentStep('completed');
    router.push('/dashboard');
  }, [completeOnboardingInDb, router]);

  const nextStep = useCallback(() => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('introduction');
        break;
      case 'introduction':
        setCurrentStep('pipeline-creation');
        break;
      case 'pipeline-creation':
        setCurrentStep('success');
        break;
      case 'success':
        completeOnboarding();
        break;
      default:
        break;
    }
  }, [currentStep, completeOnboarding]);

  // Provide onboarding context
  return (
    <OnboardingContext.Provider
      value={{
        // Onboarding state
        isOnboarding,
        currentStep,
        
        // Onboarding actions
        startOnboarding,
        completeOnboarding,
        nextStep,
        skipOnboarding,
        
        // Step-specific state
        pipelineCreated,
        setPipelineCreated,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
