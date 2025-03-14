"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type OnboardingContextType = {
  isOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  isLoading: boolean;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('user_metadata')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching onboarding status:", error);
          // If there's an error or no record, assume user needs onboarding
          setIsOnboarding(true);
        } else {
          // If onboarding_completed is false or null, user needs onboarding
          setIsOnboarding(data?.onboarding_completed === false);
        }
      } catch (err) {
        console.error("Error in onboarding check:", err);
        setIsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_metadata')
        .upsert({ 
          user_id: user.id, 
          onboarding_completed: true 
        });
      
      if (error) {
        console.error("Error updating onboarding status:", error);
        return;
      }
      
      setIsOnboarding(false);
    } catch (err) {
      console.error("Error completing onboarding:", err);
    }
  };

  return (
    <OnboardingContext.Provider value={{ isOnboarding, completeOnboarding, isLoading }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
