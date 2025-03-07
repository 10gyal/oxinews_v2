"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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
}

export function PipelineContentView({ pipelineId }: PipelineContentViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [pipelineReads, setPipelineReads] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPipelineData = async () => {
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
      
      // Then, get the pipeline reads
      const { data: readsData, error: readsError } = await supabase
        .from('pipeline_reads')
        .select('*')
        .eq('pipeline_id', pipelineData.pipeline_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (readsError) throw new Error(readsError.message);
      
      setPipelineReads(readsData);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipeline data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, [user, pipelineId]);

  const handleBack = () => {
    router.push('/dashboard/content');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content
        </Button>
        
        <Skeleton className="h-8 w-64 mb-6" />
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
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
          Back to Content
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
        Back to Content
      </Button>
      
      <h1 className="text-2xl font-bold">{pipelineName}</h1>
      
      {(!pipelineReads || pipelineReads.length === 0) ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No content available for this pipeline yet
        </div>
      ) : (
        <div className="space-y-6">
          {pipelineReads.map((read) => (
            <Card key={read.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                  {read.title || `Issue #${read.issue || 'Unknown'}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(read.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                {read.content && read.content.length > 0 ? (
                  <div className="space-y-4">
                    {read.content.map((item, index) => (
                      <div key={index} className="space-y-2">
                        {item.title && (
                          <h3 className="text-lg font-medium">{item.title}</h3>
                        )}
                        {item.description && (
                          <p>{item.description}</p>
                        )}
                        {item.url && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            Read more
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No content items available</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
