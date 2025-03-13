"use client";

import { DashboardPipelineList } from "@/components/dashboard/DashboardPipelineList";
import { FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/AuthProvider";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
      
      <Suspense fallback={
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Your Pipelines</h2>
            <Skeleton className="h-9 w-24" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      }>
        <DashboardPipelineList showDemoButton={true} userId={user?.id} />
      </Suspense>
    </div>
  );
}
