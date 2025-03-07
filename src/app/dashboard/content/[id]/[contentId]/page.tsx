"use client";

import { PipelineContentView } from "@/components/dashboard/PipelineContentView";
import { useParams } from "next/navigation";

export default function PipelineContentDetailPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  const contentId = params.contentId as string;
  
  return <PipelineContentView pipelineId={pipelineId} contentId={parseInt(contentId)} />;
}
