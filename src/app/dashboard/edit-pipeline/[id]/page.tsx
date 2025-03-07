"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { PipelineForm } from "@/components/pipeline";
import { fetchPipeline, PipelineData } from "@/components/pipeline/utils/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function EditPipelinePage() {
  const params = useParams();
  const pipelineId = params.id as string;
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  
  // Fetch pipeline data
  useEffect(() => {
    const loadPipeline = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchPipeline(user.id, pipelineId);
        
        if (result.error) {
          setError(result.error.message);
          return;
        }
        
        setPipelineData(result.data as PipelineData);
      } catch (err) {
        console.error("Error fetching pipeline:", err);
        setError(err instanceof Error ? err.message : "Failed to load pipeline data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPipeline();
  }, [pipelineId, user]);

  if (!user) {
    return <div>You must be logged in to edit a pipeline</div>;
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <PipelineForm 
      mode="edit"
      initialData={pipelineData || undefined}
      userId={user.id}
      pipelineId={pipelineId}
    />
  );
}
