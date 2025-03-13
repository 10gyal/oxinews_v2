"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";

interface PopularPipelineCardProps {
  id: string;
  name: string;
}

export function PopularPipelineCard({ id, name }: PopularPipelineCardProps) {
  const router = useRouter();
  const [contentCount, setContentCount] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isHot, setIsHot] = useState(false);
  
  useEffect(() => {
    const fetchPipelineDetails = async () => {
      try {
        // Get the pipeline_id first
        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipeline_configs')
          .select('pipeline_id')
          .eq('id', id)
          .eq('user_id', 'system')
          .single();
        
        if (pipelineError || !pipelineData) return;
        
        // Get content count and latest update
        const { data: contentData, error: contentError } = await supabase
          .from('pipeline_reads')
          .select('created_at')
          .eq('pipeline_id', pipelineData.pipeline_id)
          .eq('user_id', 'system')
          .order('created_at', { ascending: false });
        
        if (contentError || !contentData) return;
        
        setContentCount(contentData.length);
        
        // Set "hot" status if updated today and has more than 3 issues
        const isUpdatedRecently = contentData.length > 0 && 
          new Date(contentData[0].created_at).toDateString() === new Date().toDateString();
        setIsHot(isUpdatedRecently && contentData.length > 3);
        
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
  }, [id]);
  
  const handleClick = () => {
    // Use the pipeline name in the URL instead of ID
    const encodedPipelineName = encodeURIComponent(name);
    router.push(`/popular/${encodedPipelineName}`);
  };

  // Generate a consistent but theme-aligned gradient based on the pipeline name
  const getGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use theme-aligned gradients
    const themeGradients = [
      'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
      'from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30',
      'from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30',
      'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
      'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30'
    ];
    
    // Select a gradient based on the hash
    return themeGradients[Math.abs(hash) % themeGradients.length];
  };

  return (
    <Card 
      className={`group cursor-pointer overflow-hidden border transition-all hover:shadow-md ${isHot ? 'ring-1 ring-primary/20' : ''}`}
      onClick={handleClick}
    >
      <div className={`bg-gradient-to-r ${getGradient(name)}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="bg-background rounded-full p-2.5 shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium line-clamp-1">{name}</h3>
            </div>
          </div>
          
          {isHot && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Badge className="bg-primary/10 hover:bg-primary/20 text-primary border-0 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Hot
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-60">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Trending Content</h4>
                    <p className="text-xs text-muted-foreground">
                      This pipeline is actively updated and has multiple recent issues.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {contentCount !== null && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {contentCount} {contentCount === 1 ? 'issue' : 'issues'}
            </Badge>
          )}
          {lastUpdated && (
            <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {lastUpdated}
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          Explore the latest content and insights from the {name} pipeline. Updated regularly with fresh information.
        </p>
      </CardContent>
      
      <CardFooter className="p-0 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-between rounded-none h-11 px-4 text-primary"
        >
          <span className="text-sm font-medium">View content</span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
