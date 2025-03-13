"use client";

import { useOnboarding } from "@/components/providers/OnboardingProvider";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingIntroduction } from "@/components/onboarding/OnboardingIntroduction";
import { OnboardingPipelineCreation } from "@/components/onboarding/OnboardingPipelineCreation";
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess";

export default function OnboardingPage() {
  const { currentStep } = useOnboarding();

  // Render different components based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <OnboardingWelcome />;
      case 'introduction':
        return <OnboardingIntroduction />;
      case 'pipeline-creation':
        return <OnboardingPipelineCreation />;
      case 'success':
        return <OnboardingSuccess />;
      default:
        return <OnboardingWelcome />;
    }
  };

  return (
    <div className="space-y-8">
      {renderStep()}
    </div>
  );
}
