"use client";

import { ContentList } from "@/components/shared/content";
import { useParams } from "next/navigation";

export default function PopularContentListPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentList pipelineId={pipelineId} isPopular={true} userId="system" />
    </div>
  );
}
