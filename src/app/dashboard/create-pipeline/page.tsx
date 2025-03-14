"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useOnboarding } from "@/components/providers/OnboardingProvider";
import { PipelineForm } from "@/components/pipeline";

export default function CreatePipelinePage() {
  const { user } = useAuth();
  const { completeOnboarding } = useOnboarding();
  
  if (!user) {
    return <div>You must be logged in to create a pipeline</div>;
  }
  
  return (
    <PipelineForm 
      mode="create"
      userId={user.id}
      onSuccess={completeOnboarding}
    />
  );
}
