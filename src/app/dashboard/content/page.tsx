"use client";

import { PipelineList } from "@/components/shared/content";
import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ContentPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Content</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            View and manage content from your pipelines. Select a pipeline to see its content.
          </p>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <PipelineList isPopular={false} showDemoButton={true} userId={user?.id} />
    </div>
  );
}
