"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { PipelineForm } from "@/components/pipeline";

export default function CreatePipelinePage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>You must be logged in to create a pipeline</div>;
  }
  
  return (
    <PipelineForm 
      mode="create"
      userId={user.id}
    />
  );
}
