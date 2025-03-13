"use client";

import { PipelineCard, PipelineConfig } from "./PipelineCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
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
      <div className="rounded-xl border bg-card/50 shadow-sm backdrop-blur-[2px] overflow-hidden">
        <Alert variant="destructive" className="border-0 rounded-none">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">Error Loading Pipelines</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error.message}</p>
            <div className="flex gap-3">
              <Button 
                variant="destructive" 
                onClick={onRefresh} 
                className="px-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCreatePipeline}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Pipeline
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
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
    <Card className="h-full overflow-hidden animate-pulse">
      <div className="p-6 pb-2 relative">
        <div className="absolute top-0 right-0 -mt-1 -mr-1">
          <Skeleton className="h-7 w-20 rounded-bl-md rounded-tr-md rounded-br-none rounded-tl-none" />
        </div>
        <div className="pt-4 space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full col-span-2 rounded-md" />
        </div>
      </CardContent>
      
      <div className="p-4 border-t flex justify-between">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

function PipelineEmptyState({ onCreatePipeline }: { onCreatePipeline: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-xl bg-card/50 shadow-sm backdrop-blur-[2px]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6 shadow-inner">
        <Plus className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3">No pipelines yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Create your first pipeline to start receiving personalized content tailored to your interests.
      </p>
      <Button 
        onClick={onCreatePipeline}
        size="lg"
        className="px-6 py-2 shadow-sm transition-all duration-200 hover:shadow"
      >
        <Plus className="h-5 w-5 mr-2" />
        Create Your First Pipeline
      </Button>
    </div>
  );
}
