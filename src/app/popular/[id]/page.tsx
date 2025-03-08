"use client";

import { PopularContentList } from "@/components/popular/PopularContentList";
import { useParams } from "next/navigation";

export default function PopularContentListPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PopularContentList pipelineId={pipelineId} />
    </div>
  );
}
