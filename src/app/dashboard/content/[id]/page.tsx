"use client";

import { PipelineContentList } from "@/components/dashboard/PipelineContentList";
import { useParams } from "next/navigation";

export default function PipelineContentListPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  
  return <PipelineContentList pipelineId={pipelineId} />;
}
