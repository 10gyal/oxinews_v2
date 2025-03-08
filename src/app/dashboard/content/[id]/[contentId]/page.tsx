"use client";

import { ContentView } from "@/components/shared/content";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PipelineContentDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const pipelineId = params.id as string;
  const contentId = params.contentId as string;
  
  return (
    <div className="container">
      <ContentView 
        pipelineId={pipelineId} 
        contentId={parseInt(contentId)} 
        isPopular={false} 
        userId={user?.id} 
      />
    </div>
  );
}
