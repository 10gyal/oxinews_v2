"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  RefreshCcw, 
  FileText, 
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ContentTemplate, ContentItemDetailed } from "../dashboard/ContentTemplate";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentItem {
  title?: string;
  description?: string;
  url?: string;
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

interface PopularContentViewProps {
  pipelineId: string;
  contentId: number;
}

export function PopularContentView({ pipelineId, contentId }: PopularContentViewProps) {
  const router = useRouter();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [pipelineReads, setPipelineReads] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextContentId, setNextContentId] = useState<number | null>(null);
  const [prevContentId, setPrevContentId] = useState<number | null>(null);

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
      
      // Get all content IDs to determine next/prev
      const { data: allReadsData, error: allReadsError } = await supabase
        .from('pipeline_reads')
        .select('id, created_at')
        .eq('pipeline_id', pipelineData.pipeline_id)
        .eq('user_id', 'system')
        .order('created_at', { ascending: false });
      
      if (allReadsError) throw new Error(allReadsError.message);
      
      if (allReadsData && allReadsData.length > 0) {
        const currentIndex = allReadsData.findIndex(item => item.id === contentId);
        
        if (currentIndex > 0) {
          setNextContentId(allReadsData[currentIndex - 1].id);
        } else {
          setNextContentId(null);
        }
        
        if (currentIndex < allReadsData.length - 1) {
          setPrevContentId(allReadsData[currentIndex + 1].id);
        } else {
          setPrevContentId(null);
        }
      }
      
      // Then, get the specific pipeline read by contentId
      const { data: readData, error: readError } = await supabase
        .from('pipeline_reads')
        .select('*')
        .eq('id', contentId)
        .eq('user_id', 'system')
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
  };

  useEffect(() => {
    fetchPipelineData();
  }, [pipelineId, contentId]);

  const handleBack = () => {
    router.push(`/popular/${pipelineId}`);
  };

  const handleRefresh = () => {
    fetchPipelineData();
  };

  const handlePrevContent = () => {
    if (prevContentId) {
      router.push(`/popular/${pipelineId}/${prevContentId}`);
    }
  };

  const handleNextContent = () => {
    if (nextContentId) {
      router.push(`/popular/${pipelineId}/${nextContentId}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${pipelineName} - Issue #${read?.issue || 'Unknown'}`,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderSkeletons = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
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
          Back to Content List
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
          Back to Content List
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
  
  const read = pipelineReads?.[0];
  
  if (!read) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Content List
        </Button>
        
        <div className="rounded-lg border bg-card p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Content Not Found</h3>
            <p className="text-muted-foreground max-w-md">
              The requested content could not be found or may have been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 pb-12">
      {/* Navigation and actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Content List
        </Button>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleShare}
                  className="h-8 w-8"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePrint}
                  className="h-8 w-8"
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Print this content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Pipeline info and content header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: `hsl(${pipelineName.length * 10 % 360}, 70%, 90%)`,
              color: `hsl(${pipelineName.length * 10 % 360}, 70%, 30%)`
            }}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">{pipelineName}</h2>
            <h1 className="text-2xl font-bold">Issue #{read.issue || 'Unknown'}</h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="outline" className="rounded-full">
            Issue #{read.issue || 'Unknown'}
          </Badge>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(read.created_at)}
          </div>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      {/* Content */}
      <div className="space-y-8">
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
                // Use the ContentTemplate for detailed content
                return (
                  <ContentTemplate 
                    key={index} 
                    content={item as unknown as ContentItemDetailed} 
                  />
                );
              } else {
                // Fallback for legacy content format
                return (
                  <Card key={index} className="overflow-hidden border-2">
                    <CardHeader className="pb-3 bg-muted/30">
                      {item.title && (
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6">
                      {item.description && (
                        <p className="text-muted-foreground mb-4">{item.description}</p>
                      )}
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-500 hover:underline"
                        >
                          Read more <ChevronRight className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              }
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No content items available</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Navigation between content items */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevContent}
          disabled={!prevContentId}
          className={!prevContentId ? "opacity-50 cursor-not-allowed" : ""}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Issue
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextContent}
          disabled={!nextContentId}
          className={!nextContentId ? "opacity-50 cursor-not-allowed" : ""}
        >
          Next Issue
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
