"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, RefreshCw, FileText, Calendar, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ContentTemplate, ContentItemDetailed } from "./ContentTemplate";

interface ContentItem {
  title?: string;
  description?: string;
  url?: string;
  // Use unknown instead of any for better type safety
  [key: string]: string | number | boolean | object | undefined;
}

interface PipelineRead {
  id: number;
  created_at: string;
  title: string;
  pipeline_name: string;
  content: ContentItem[];
  user_id: string;
  pipeline_id: string;
  issue: number;
}

interface PipelineContentViewProps {
  pipelineId: string;
  contentId: number;
}

export function PipelineContentView({ pipelineId, contentId }: PipelineContentViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [pipelineReads, setPipelineReads] = useState<PipelineRead[] | null>(null);
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
      
      // Then, get the specific pipeline read by contentId
      const { data: readData, error: readError } = await supabase
        .from('pipeline_reads')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', user.id)
        .single();
      
      if (readError) throw new Error(readError.message);
      if (!readData) throw new Error('Content not found');
      
      setPipelineReads([readData]);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipeline data'));
    } finally {
      setIsLoading(false);
    }
  }, [user, pipelineId, contentId]);

  useEffect(() => {
    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId, fetchPipelineData]);

  const handleBack = () => {
    router.push(`/dashboard/content/${pipelineId}`);
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
          Back to Content List
        </Button>
        
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
        </div>
        
        <Card className="overflow-hidden shadow-sm animate-pulse">
          <div className="p-6 pb-3">
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-56" />
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </Card>
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
          Back to Content List
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
        Back to Content List
      </Button>
      
      <h1 className="text-3xl font-bold tracking-tight">{pipelineName}</h1>
      
      {(!pipelineReads || pipelineReads.length === 0) ? (
        <div className="rounded-xl border bg-card/50 p-10 text-center shadow-sm backdrop-blur-[2px]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No content available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              This content item couldn&apos;t be found. It may have been deleted or there was an error loading it.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {pipelineReads.map((read) => (
            <Card key={read.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <CardTitle className="text-xl flex items-center">
                    <Badge variant="outline" className="mr-2 bg-primary/5 text-primary">
                      Issue #{read.issue || 'Unknown'}
                    </Badge>
                    {read.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    {new Date(read.created_at).toLocaleDateString()} {new Date(read.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {read.content && read.content.length > 0 ? (
                  <div className="space-y-8">
                    {read.content.map((item, index) => {
                      // Check if the item has the detailed structure
                      const hasDetailedStructure = 
                        item.title && 
                        item.summary && 
                        Array.isArray(item.sources) && 
                        Array.isArray(item.keyPoints) && 
                        Array.isArray(item.relevantLinks) && 
                        item.overallSentiment;
                      
                      if (hasDetailedStructure) {
                        // Use the new ContentTemplate for detailed content
                        return (
                          <ContentTemplate 
                            key={index} 
                            content={item as unknown as ContentItemDetailed} 
                          />
                        );
                      } else {
                        // Fallback for legacy content format
                        return (
                          <div key={index} className="space-y-3 p-4 border rounded-lg bg-card/50">
                            {item.title && (
                              <h3 className="text-xl font-medium">{item.title}</h3>
                            )}
                            {item.description && (
                              <p className="text-muted-foreground">{item.description}</p>
                            )}
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-primary hover:underline"
                              >
                                Read more <ExternalLink className="h-3.5 w-3.5 ml-1" />
                              </a>
                            )}
                          </div>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">No content items available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
