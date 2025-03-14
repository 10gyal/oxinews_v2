import React from "react";
import { FileText, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "./ContentViewUtils";

interface ContentViewInfoProps {
  pipelineName: string;
  issueNumber: number | string;
  createdAt: string;
}

export function ContentViewInfo({
  pipelineName,
  issueNumber,
  createdAt,
}: ContentViewInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">{pipelineName}</h2>
          <h1 className="text-2xl font-bold">Issue #{issueNumber || 'Unknown'}</h1>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="outline" className="rounded-full">
          Issue #{issueNumber || 'Unknown'}
        </Badge>
        
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(createdAt)}
        </div>
      </div>
      
      <Separator className="my-2" />
    </div>
  );
}
