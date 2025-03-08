"use client";

import { ContentList } from "@/components/shared/content";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PipelineContentListPage() {
  const params = useParams();
  const { user } = useAuth();
  const pipelineId = params.id as string;
  
  return (
    <div className="container">
      <ContentList 
        pipelineId={pipelineId} 
        isPopular={false} 
        userId={user?.id} 
      />
    </div>
  );
}
