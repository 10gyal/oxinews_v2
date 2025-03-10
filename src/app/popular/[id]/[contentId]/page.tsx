"use client";

import { ContentView } from "@/components/shared/content";
import { useParams } from "next/navigation";

export default function PopularContentDetailPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  const contentId = params.contentId as string;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentView 
        pipelineId={pipelineId} 
        contentId={parseInt(contentId)} 
        isPopular={true} 
        userId="system" 
      />
    </div>
  );
}
