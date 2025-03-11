"use client";

import { ContentView } from "@/components/shared/content";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PopularContentViewPage() {
  const params = useParams();
  const pipelineName = params.pipeline_name as string;
  const title = params.title as string;
  const router = useRouter();
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [contentId, setContentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Get the pipeline ID from the pipeline name
        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipeline_configs')
          .select('id, pipeline_id')
          .eq('pipeline_name', decodeURIComponent(pipelineName))
          .eq('user_id', 'system')
          .single();
        
        if (pipelineError) throw pipelineError;
        if (!pipelineData) throw new Error('Pipeline not found');
        
        setPipelineId(pipelineData.id);
        
        // Get the content ID from the title and pipeline ID
        const { data: contentData, error: contentError } = await supabase
          .from('pipeline_reads')
          .select('id')
          .eq('title', decodeURIComponent(title))
          .eq('pipeline_id', pipelineData.pipeline_id)
          .eq('user_id', 'system')
          .single();
        
        if (contentError) throw contentError;
        if (!contentData) throw new Error('Content not found');
        
        setContentId(contentData.id);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Content not found");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [pipelineName, title]);
  
  const handleBack = () => {
    router.push(`/popular/${pipelineName}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pipeline
        </Button>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (error || !pipelineId || !contentId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pipeline
        </Button>
        <div>Error: {error || "Content not found"}</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentView 
        pipelineId={pipelineId} 
        contentId={contentId} 
        isPopular={true} 
        userId="system" 
      />
    </div>
  );
}
