"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface PipelineCardProps {
  id: string;
  name: string;
  isPopular?: boolean;
  userId?: string;
}

export function PipelineCard({ id, name, isPopular = false, userId }: PipelineCardProps) {
  // For popular content, always use 'system' as the user ID
  // For user content, default to 'system' if userId is undefined
  const effectiveUserId = isPopular ? 'system' : (userId || 'system');
  const router = useRouter();
  const [contentCount, setContentCount] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPipelineDetails = async () => {
      try {
        // Get the pipeline_id first
        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipeline_configs')
          .select('pipeline_id')
          .eq('id', id)
          .eq('user_id', effectiveUserId);
        
        if (pipelineError || !pipelineData || pipelineData.length === 0) return;
        
        // Use the first matching pipeline
        const pipeline = pipelineData[0];
        
        // Get content count and latest update
        const { data: contentData, error: contentError } = await supabase
          .from('pipeline_reads')
          .select('created_at')
          .eq('pipeline_id', pipeline.pipeline_id)
          .eq('user_id', effectiveUserId)
          .order('created_at', { ascending: false });
        
        if (contentError || !contentData) return;
        
        setContentCount(contentData.length);
        
        if (contentData.length > 0) {
          const latestDate = new Date(contentData[0].created_at);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - latestDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            setLastUpdated('Today');
          } else if (diffDays === 1) {
            setLastUpdated('Yesterday');
          } else if (diffDays < 7) {
            setLastUpdated(`${diffDays} days ago`);
          } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            setLastUpdated(`${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`);
          } else {
            const months = Math.floor(diffDays / 30);
            setLastUpdated(`${months} ${months === 1 ? 'month' : 'months'} ago`);
          }
        }
      } catch (err) {
        console.error("Error fetching pipeline details:", err);
      }
    };
    
    fetchPipelineDetails();
  }, [id, effectiveUserId]);
  
  const handleClick = () => {
    if (isPopular) {
      router.push(`/popular/${id}`);
    } else {
      router.push(`/dashboard/content/${id}`);
    }
  };

  // Generate a consistent but theme-aligned color based on the pipeline name
  const getBackgroundColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use theme-aligned colors with lower saturation
    const themeColors = [
      'hsl(210, 20%, 95%)', // Soft blue
      'hsl(240, 20%, 95%)', // Soft indigo
      'hsl(180, 20%, 95%)', // Soft teal
      'hsl(150, 20%, 95%)', // Soft green
      'hsl(270, 20%, 95%)'  // Soft purple
    ];
    
    // Select a color based on the hash
    return themeColors[Math.abs(hash) % themeColors.length];
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all overflow-hidden border-2"
      onClick={handleClick}
    >
      <div 
        className="h-3" 
        style={{ backgroundColor: getBackgroundColor(name) }}
      />
      <CardContent className="p-6 pt-5">
        <div className="flex items-start gap-3">
          <div className="bg-muted rounded-full p-2 mt-1">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-xl font-medium">{name}</h3>
            <div className="flex flex-wrap gap-2">
              {contentCount !== null && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {contentCount} {contentCount === 1 ? 'issue' : 'issues'}
                </Badge>
              )}
              {lastUpdated && (
                <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Updated {lastUpdated}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 bg-muted/50">
        <div className="w-full p-3 flex justify-end items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          View content <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </CardFooter>
    </Card>
  );
}
