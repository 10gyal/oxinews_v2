"use client";

import { useState, useEffect } from "react";
import { ContentPipelineCard } from "./ContentPipelineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

interface SimplePipeline {
  id: string;
  pipeline_name: string;
}

export function ContentPipelineList() {
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState<SimplePipeline[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipelines = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('pipeline_configs')
        .select('id, pipeline_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setPipelines(data);
    } catch (err) {
      console.error("Error fetching pipelines:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipelines'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, [user]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load pipelines: {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!pipelines || pipelines.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        No pipelines found. Create a pipeline in the dashboard first.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pipelines.map((pipeline) => (
        <ContentPipelineCard 
          key={pipeline.id} 
          id={pipeline.id} 
          name={pipeline.pipeline_name} 
        />
      ))}
    </div>
  );
}
