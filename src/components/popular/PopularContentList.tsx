"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Calendar } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PipelineRead {
  id: number;
  created_at: string;
  title: string;
  issue?: number;
}

interface PopularContentListProps {
  pipelineId: string;
}

export function PopularContentList({ pipelineId }: PopularContentListProps) {
  const router = useRouter();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [contentItems, setContentItems] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipelineData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the pipeline name and id
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipeline_configs')
        .select('pipeline_name, pipeline_id')
        .eq('id', pipelineId)
        .eq('user_id', 'system')
        .single();
      
      if (pipelineError) throw new Error(pipelineError.message);
      if (!pipelineData) throw new Error('Pipeline not found');
      
      setPipelineName(pipelineData.pipeline_name);
      
      // Then, get the pipeline reads (only id, title, created_at)
      const { data: readsData, error: readsError } = await supabase
        .from('pipeline_reads')
        .select('id, title, created_at, issue')
        .eq('pipeline_id', pipelineData.pipeline_id)
        .eq('user_id', 'system')
        .order('created_at', { ascending: false });
      
      if (readsError) throw new Error(readsError.message);
      
      setContentItems(readsData as PipelineRead[]);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipeline data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [pipelineId]);

  const handleBack = () => {
    router.push('/popular');
  };

  const handleContentClick = (contentId: number) => {
    router.push(`/popular/${pipelineId}/${contentId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Popular
        </Button>
        
        <Skeleton className="h-8 w-64 mb-6" />
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Popular
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Popular
      </Button>
      
      <div>
        <h1 className="text-2xl font-bold">{pipelineName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a content item to view details
        </p>
      </div>
      
      {(!contentItems || contentItems.length === 0) ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No content available for this pipeline yet
        </div>
      ) : (
        <div className="space-y-4">
          {contentItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleContentClick(item.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h3 className="text-xl font-medium">
                      {item.title || 'Untitled Content'}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      Issue #{item.issue || 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
