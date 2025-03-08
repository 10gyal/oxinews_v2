"use client";

import { PipelineCard, PipelineConfig } from "./PipelineCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PipelineGridProps {
  pipelines: PipelineConfig[] | null;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export function PipelineGrid({ pipelines, isLoading, error, onRefresh }: PipelineGridProps) {
  const router = useRouter();
  
  // Handle create pipeline
  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };
  
  // Add a timeout to automatically exit loading state after 5 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        console.log("PipelineGrid loading timeout reached");
        onRefresh(); // Try to refresh data
      }, 5000); // 5 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, onRefresh]);
  
  if (isLoading) {
    console.log("PipelineGrid rendering loading state");
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <PipelineCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (error) {
    console.log("PipelineGrid rendering error state:", error.message);
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load pipelines: {error.message}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!pipelines || pipelines.length === 0) {
    console.log("PipelineGrid rendering empty state");
    return <PipelineEmptyState onCreatePipeline={handleCreatePipeline} />;
  }
  
  console.log("PipelineGrid rendering pipelines:", pipelines.length);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pipelines.map((pipeline) => (
        <PipelineCard 
          key={pipeline.id} 
          pipeline={pipeline} 
          onUpdate={onRefresh}
        />
      ))}
    </div>
  );
}

function PipelineCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full col-span-2" />
          </div>
          <div className="flex justify-between pt-2">
            <Skeleton className="h-5 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineEmptyState({ onCreatePipeline }: { onCreatePipeline: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
        <Plus className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No pipelines yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create your first pipeline to start receiving personalized content.
      </p>
      <Button onClick={onCreatePipeline}>
        <Plus className="h-4 w-4 mr-2" />
        Create Pipeline
      </Button>
    </div>
  );
}
