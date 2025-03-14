"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyDashboard() {
  const router = useRouter();

  const handleCreatePipeline = async () => {
    router.push("/dashboard/create-pipeline");
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">No pipelines yet</h2>
          <p className="text-muted-foreground">
            Create your first pipeline to start receiving personalized content
          </p>
        </div>
        
        <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
          <div className="bg-background rounded-full w-16 h-16 mx-auto flex items-center justify-center shadow-sm">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">What is a pipeline?</h3>
            <p className="text-sm text-muted-foreground">
              A pipeline collects and organizes content from sources you&apos;re interested in.
              It helps you stay updated with relevant information without the noise.
            </p>
          </div>
          
          <Button 
            onClick={handleCreatePipeline}
            className="w-full shadow-sm transition-all duration-200 hover:shadow"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Pipeline
          </Button>
        </div>
      </div>
    </div>
  );
}
