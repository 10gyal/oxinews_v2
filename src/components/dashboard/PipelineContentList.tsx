"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Calendar, RefreshCw, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface PipelineRead {
  id: number;
  created_at: string;
  title: string;
  issue?: number;
}

interface PipelineContentListProps {
  pipelineId: string;
}

export function PipelineContentList({ pipelineId }: PipelineContentListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [contentItems, setContentItems] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipelineData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the pipeline name and id
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipeline_configs')
        .select('pipeline_name, pipeline_id')
        .eq('id', pipelineId)
        .eq('user_id', user.id)
        .single();
      
      if (pipelineError) throw new Error(pipelineError.message);
      if (!pipelineData) throw new Error('Pipeline not found');
      
      setPipelineName(pipelineData.pipeline_name);
      
      // Then, get the pipeline reads (only id, title, created_at)
      const { data: readsData, error: readsError } = await supabase
        .from('pipeline_reads')
        .select('id, title, created_at, issue')
        .eq('pipeline_id', pipelineData.pipeline_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (readsError) throw new Error(readsError.message);
      
      setContentItems(readsData as PipelineRead[]);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipeline data'));
    } finally {
      setIsLoading(false);
    }
  }, [user, pipelineId]);

  useEffect(() => {
    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId, fetchPipelineData]);

  const handleBack = () => {
    router.push('/dashboard/content');
  };

  const handleContentClick = (contentId: number) => {
    router.push(`/dashboard/content/${pipelineId}/${contentId}`);
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
      <div className="space-y-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack} 
          className="mb-4 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content
        </Button>
        
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-sm animate-pulse">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Skeleton className="h-7 w-3/4" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack} 
          className="mb-4 rounded-full hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content
        </Button>
        
        <div className="rounded-xl border bg-card/50 shadow-sm backdrop-blur-[2px] overflow-hidden">
          <Alert variant="destructive" className="border-0 rounded-none">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Error Loading Content</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">{error.message}</p>
              <Button 
                variant="destructive" 
                onClick={fetchPipelineData} 
                className="px-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack} 
        className="mb-4 rounded-full hover:bg-muted/50 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content
      </Button>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{pipelineName}</h1>
        <p className="text-muted-foreground">
          Select a content item to view details
        </p>
      </div>
      
      {(!contentItems || contentItems.length === 0) ? (
        <div className="rounded-xl border bg-card/50 p-10 text-center shadow-sm backdrop-blur-[2px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No content available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              This pipeline hasn&apos;t generated any content yet. Check back later or adjust your pipeline settings.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {contentItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:bg-accent/30 hover:shadow-md transition-all duration-200 overflow-hidden"
              onClick={() => handleContentClick(item.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-xl font-medium">
                      {item.title || 'Untitled Content'}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs rounded-full bg-primary/5 hover:bg-primary/10">
                      Issue #{item.issue || 'Unknown'}
                    </Badge>
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
