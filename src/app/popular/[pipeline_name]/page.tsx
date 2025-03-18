"use client";

import { ContentList } from "@/components/shared/content";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SYSTEM_USER_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PopularPipelineContentPage() {
  const params = useParams();
  const pipelineName = params.pipeline_name as string;
  const router = useRouter();
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPipelineId() {
      try {
        // Get the pipeline ID from the pipeline name
        const { data, error } = await supabase
          .from('pipeline_configs')
          .select('id')
          .eq('pipeline_name', decodeURIComponent(pipelineName))
          .eq('user_id', SYSTEM_USER_ID)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Pipeline not found');
        
        setPipelineId(data.id);
      } catch (err) {
        console.error("Error fetching pipeline:", err);
        setError("Pipeline not found");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPipelineId();
  }, [pipelineName]);
  
  const handleBack = () => {
    router.push('/popular');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Popular
        </Button>
        <div>Loading...</div>
      </div>
    );
  }
  
  if (error || !pipelineId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Popular
        </Button>
        <div>Error: {error || "Pipeline not found"}</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentList pipelineId={pipelineId} isPopular={true} userId={SYSTEM_USER_ID} />
    </div>
  );
}
