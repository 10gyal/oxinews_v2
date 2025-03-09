"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  RefreshCcw, 
  FileText, 
  Search,
  ChevronRight,
  Clock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface PipelineRead {
  id: number;
  created_at: string;
  title: string;
  issue?: number;
}

interface ContentListProps {
  pipelineId: string;
  isPopular?: boolean;
  userId?: string;
}

export function ContentList({ pipelineId, isPopular = false, userId }: ContentListProps) {
  // For popular content, always use 'system' as the user ID
  // For user content, default to 'system' if userId is undefined
  const effectiveUserId = isPopular ? 'system' : (userId || 'system');
  const router = useRouter();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [contentItems, setContentItems] = useState<PipelineRead[] | null>(null);
  const [filteredItems, setFilteredItems] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPipelineData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the pipeline name and id
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipeline_configs')
        .select('pipeline_name, pipeline_id')
        .eq('id', pipelineId)
        .eq('user_id', effectiveUserId);
      
      if (pipelineError) throw new Error(pipelineError.message);
      if (!pipelineData || pipelineData.length === 0) throw new Error('Pipeline not found');
      
      // Use the first matching pipeline
      const pipeline = pipelineData[0];
      setPipelineName(pipeline.pipeline_name);
      
      // Then, get the pipeline reads (only id, title, created_at)
      const { data: readsData, error: readsError } = await supabase
        .from('pipeline_reads')
        .select('id, title, created_at, issue')
        .eq('pipeline_id', pipeline.pipeline_id)
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });
      
      if (readsError) throw new Error(readsError.message);
      
      setContentItems(readsData as PipelineRead[]);
      setFilteredItems(readsData as PipelineRead[]);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipeline data'));
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId, effectiveUserId]);

  useEffect(() => {
    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId, fetchPipelineData]);

  // Filter content items when search query changes
  useEffect(() => {
    if (!contentItems) return;
    
    if (!searchQuery) {
      setFilteredItems(contentItems);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = contentItems.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) || 
      (item.issue && item.issue.toString().includes(query))
    );
    
    setFilteredItems(filtered);
  }, [contentItems, searchQuery]);

  const handleBack = () => {
    if (isPopular) {
      router.push('/popular');
    } else {
      router.push('/dashboard/content');
    }
  };

  const handleRefresh = () => {
    fetchPipelineData();
  };

  const handleContentClick = (contentId: number) => {
    if (isPopular) {
      router.push(`/popular/${pipelineId}/${contentId}`);
    } else {
      router.push(`/dashboard/content/${pipelineId}/${contentId}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      
      <Skeleton className="h-12 w-full rounded-lg" />
      
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {isPopular ? 'Popular' : 'Content'}
        </Button>
        
        {renderSkeletons()}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {isPopular ? 'Popular' : 'Content'}
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Error Loading Content</h1>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to {isPopular ? 'Popular' : 'Content'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{pipelineName}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {contentItems?.length || 0} {contentItems?.length === 1 ? 'issue' : 'issues'} available • Select an item to view details
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Separator />
      
      {(!filteredItems || filteredItems.length === 0) ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No content found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery 
                ? "No content matches your search criteria. Try a different search term."
                : "No content available for this pipeline yet. Check back later."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-md transition-all overflow-hidden border-2"
              onClick={() => handleContentClick(item.id)}
            >
              <div className="h-2 bg-primary/10" />
              <CardContent className="p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-medium">
                        {item.title || 'Untitled Content'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full">
                          Issue #{item.issue || 'Unknown'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {getRelativeTime(item.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(item.created_at)}
                      </div>
                      <div>{formatTime(item.created_at)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0 bg-muted/50">
                <div className="w-full p-3 flex justify-end items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  View details <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
