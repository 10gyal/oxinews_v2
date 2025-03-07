"use client";

import { PipelineContentView } from "@/components/dashboard/PipelineContentView";
import { useParams } from "next/navigation";

export default function PipelineContentPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  
  return <PipelineContentView pipelineId={pipelineId} />;
}
