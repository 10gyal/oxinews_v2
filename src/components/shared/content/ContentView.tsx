"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ContentViewProps, PipelineRead } from "./types";
import { ContentViewSkeleton } from "./ContentViewSkeleton";
import { ContentViewError } from "./ContentViewError";
import { ContentViewHeader } from "./ContentViewHeader";
import { ContentViewInfo } from "./ContentViewInfo";
import { ContentViewJumpMenu } from "./ContentViewJumpMenu";
import { ContentItemRenderer } from "./ContentItemRenderer";
import { ContentViewNavigation } from "./ContentViewNavigation";
import { ContentViewNotFound } from "./ContentViewNotFound";

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

  if (isLoading) {
    return <ContentViewSkeleton onBack={handleBack} />;
  }
  
  if (error) {
    return <ContentViewError error={error} onBack={handleBack} onRetry={handleRefresh} />;
  }
  
  const read = pipelineReads?.[0];
  
  if (!read) {
    return <ContentViewNotFound onBack={handleBack} />;
  }
  
  return (
    <div className="space-y-8 pb-12">
      {/* Header with navigation and actions */}
      <ContentViewHeader 
        onBack={handleBack}
        onRefresh={handleRefresh}
        onShare={handleShare}
        onPrint={handlePrint}
        isPopular={isPopular}
      />
      
      {/* Pipeline info and content header */}
      <ContentViewInfo 
        pipelineName={pipelineName}
        issueNumber={read.issue}
        createdAt={read.created_at}
      />
      
      {/* Jump Navigation */}
      {read.content && read.content.length > 0 && (
        <ContentViewJumpMenu 
          isOpen={isNavOpen}
          onToggle={() => setIsNavOpen(!isNavOpen)}
          contentItems={read.content}
          onJumpToSection={scrollToSection}
        />
      )}
      
      {/* Content */}
      <div className="space-y-8">
        {read.content && read.content.length > 0 ? (
          <div className="space-y-8">
            {read.content.map((item, index) => (
              <ContentItemRenderer 
                key={index}
                item={item}
                index={index}
              />
            ))}
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
      <ContentViewNavigation 
        onPrevious={handlePrevContent}
        onNext={handleNextContent}
        hasPrevious={!!prevContentId}
        hasNext={!!nextContentId}
      />
    </div>
  );
}
