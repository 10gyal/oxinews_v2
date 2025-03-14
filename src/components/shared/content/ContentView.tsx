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
  Share2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Info,
  List,
  Menu,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ContentTemplate, ContentItemDetailed } from "@/components/dashboard/ContentTemplate";
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

interface ContentViewProps {
  pipelineId: string;
  contentId: number;
  isPopular?: boolean;
  userId?: string;
}

export function ContentView({ pipelineId, contentId, isPopular = false, userId }: ContentViewProps) {
  // For popular content, always use 'system' as the user ID
  // For user content, default to 'system' if userId is undefined
  const effectiveUserId = isPopular ? 'system' : (userId || 'system');
  const router = useRouter();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [pipelineReads, setPipelineReads] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextContentId, setNextContentId] = useState<number | null>(null);
  const [prevContentId, setPrevContentId] = useState<number | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const fetchPipelineData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching pipeline with ID: ${pipelineId}, User ID: ${effectiveUserId}`);
      
      // Query for the pipeline without user_id filter
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipeline_configs')
        .select('pipeline_name, pipeline_id, user_id')
        .or('id.eq.' + pipelineId + ',pipeline_id.eq.' + pipelineId);
      
      console.log('Pipeline data:', pipelineData);
      
      if (pipelineError) {
        console.error('Error fetching pipeline:', pipelineError);
        throw new Error(pipelineError.message);
      }
      
      if (!pipelineData || pipelineData.length === 0) {
        console.error('No pipeline found with ID:', pipelineId);
        throw new Error('Pipeline not found - ID does not exist in database');
      }
      
      // Use the first matching pipeline
      const pipeline = pipelineData[0];
      setPipelineName(pipeline.pipeline_name);
      
      // Get all content IDs to determine next/prev - don't filter by user_id
      const { data: allReadsData, error: allReadsError } = await supabase
        .from('pipeline_reads')
        .select('id, created_at')
        .eq('pipeline_id', pipeline.pipeline_id)
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
      
      // Then, get the specific pipeline read by contentId - don't filter by user_id
      const { data: readData, error: readError } = await supabase
        .from('pipeline_reads')
        .select('*')
        .eq('id', contentId)
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
  }, [pipelineId, contentId, effectiveUserId]);

  useEffect(() => {
    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId, fetchPipelineData]);

  const handleBack = () => {
    if (isPopular) {
      // Get the pipeline name from the URL for popular content
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments.length >= 3) {
        const encodedPipelineName = pathSegments[2]; // /popular/[pipeline_name]/[title]
        router.push(`/popular/${encodedPipelineName}`);
      } else {
        // Fallback to the old route structure if needed
        router.push(`/popular/${pipelineId}`);
      }
    } else {
      router.push(`/dashboard/content/${pipelineId}`);
    }
  };

  const handleRefresh = () => {
    fetchPipelineData();
  };
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevContent = () => {
    if (prevContentId) {
      if (isPopular) {
        // For popular content, we need to fetch the title for the previous content
        const prevItem = pipelineReads?.find(item => item.id === prevContentId);
        if (prevItem && prevItem.title) {
          const pathSegments = window.location.pathname.split('/');
          if (pathSegments.length >= 3) {
            const encodedPipelineName = pathSegments[2]; // /popular/[pipeline_name]/[title]
            const encodedTitle = encodeURIComponent(prevItem.title);
            router.push(`/popular/${encodedPipelineName}/${encodedTitle}`);
          } else {
            // Fallback to the old route structure if needed
            router.push(`/popular/${pipelineId}/${prevContentId}`);
          }
        } else {
          // If we can't find the title, use the ID as fallback
          router.push(`/popular/${pipelineId}/${prevContentId}`);
        }
      } else {
        router.push(`/dashboard/content/${pipelineId}/${prevContentId}`);
      }
    }
  };

  const handleNextContent = () => {
    if (nextContentId) {
      if (isPopular) {
        // For popular content, we need to fetch the title for the next content
        const nextItem = pipelineReads?.find(item => item.id === nextContentId);
        if (nextItem && nextItem.title) {
          const pathSegments = window.location.pathname.split('/');
          if (pathSegments.length >= 3) {
            const encodedPipelineName = pathSegments[2]; // /popular/[pipeline_name]/[title]
            const encodedTitle = encodeURIComponent(nextItem.title);
            router.push(`/popular/${encodedPipelineName}/${encodedTitle}`);
          } else {
            // Fallback to the old route structure if needed
            router.push(`/popular/${pipelineId}/${nextContentId}`);
          }
        } else {
          // If we can't find the title, use the ID as fallback
          router.push(`/popular/${pipelineId}/${nextContentId}`);
        }
      } else {
        router.push(`/dashboard/content/${pipelineId}/${nextContentId}`);
      }
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
          {isPopular && (
            <>
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
            </>
          )}
          
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
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
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
      
      {/* Floating Jump Navigation Toggle Button - Hidden on mobile, visible on md screens and up */}
      <div className="fixed right-0 top-1/3 z-50 hidden md:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="default" 
                className="rounded-l-md rounded-r-none shadow-lg px-3 py-6 bg-primary hover:bg-primary/90 transition-all duration-200"
                onClick={() => setIsNavOpen(!isNavOpen)}
              >
                <div className="flex flex-col items-center">
                  {isNavOpen ? (
                    <>
                      <X className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">Close</span>
                    </>
                  ) : (
                    <>
                      <Menu className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">Jump</span>
                    </>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isNavOpen ? 'Close navigation' : 'Open content navigation'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Slide-in Jump Navigation - Hidden on mobile, visible on md screens and up */}
      <div 
        className={`fixed right-0 top-1/3 transform transition-transform duration-300 ease-in-out z-40 hidden md:block ${
          isNavOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ marginTop: '40px' }}
      >
        <Card className="w-64 shadow-lg rounded-l-md rounded-r-none border-r-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <List className="h-4 w-4 mr-2" />
              Jump to Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {read.content && read.content.length > 0 && read.content.map((item, index) => {
                  // Only create navigation buttons for items with titles
                  if (item.title) {
                    const contentId = `content-item-${index}`;
                    return (
                      <Button 
                        key={index}
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left" 
                        onClick={() => {
                          scrollToSection(contentId);
                          // Optionally close the navigation after clicking
                          // setIsNavOpen(false);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title}
                        </span>
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
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
              
              const contentId = `content-item-${index}`;
              
              if (hasDetailedStructure) {
                // Use the ContentTemplate for detailed content
                return (
                  <div key={index} id={contentId}>
                    <ContentTemplate 
                      content={item as unknown as ContentItemDetailed} 
                    />
                  </div>
                );
              } else {
                // Fallback for legacy content format
                return (
                  <Card key={index} id={contentId} className="overflow-hidden border-2">
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
