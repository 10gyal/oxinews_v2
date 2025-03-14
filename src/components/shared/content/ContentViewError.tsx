import React from "react";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ContentViewErrorProps {
  error: Error;
  onBack: () => void;
  onRetry: () => void;
}

export function ContentViewError({ error, onBack, onRetry }: ContentViewErrorProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content List
      </Button>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Error Loading Content</h1>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
      
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    </div>
  );
}
