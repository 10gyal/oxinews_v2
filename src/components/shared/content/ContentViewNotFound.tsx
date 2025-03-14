import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentViewNotFoundProps {
  onBack: () => void;
}

export function ContentViewNotFound({ onBack }: ContentViewNotFoundProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="group">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Content List
      </Button>
      
      <div className="rounded-lg border bg-card p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="rounded-full bg-muted p-3">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Content Not Found</h3>
          <p className="text-muted-foreground max-w-md">
            The requested content could not be found or may have been removed.
          </p>
        </div>
      </div>
    </div>
  );
}
