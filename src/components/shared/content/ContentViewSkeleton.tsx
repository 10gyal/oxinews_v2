import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ContentViewSkeletonProps {
  onBack: () => void;
}

export function ContentViewSkeleton({ onBack }: ContentViewSkeletonProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content List
      </Button>
      
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
