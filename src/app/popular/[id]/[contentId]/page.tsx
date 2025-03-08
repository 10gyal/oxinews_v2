"use client";

import { PopularContentView } from "@/components/popular/PopularContentView";
import { useParams } from "next/navigation";

export default function PopularContentDetailPage() {
  const params = useParams();
  const pipelineId = params.id as string;
  const contentId = params.contentId as string;
  
  return <PopularContentView pipelineId={pipelineId} contentId={parseInt(contentId)} />;
}
