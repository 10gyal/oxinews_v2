import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentViewNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function ContentViewNavigation({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ContentViewNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={!hasPrevious ? "opacity-50 cursor-not-allowed" : ""}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous Issue
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNext}
        className={!hasNext ? "opacity-50 cursor-not-allowed" : ""}
      >
        Next Issue
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
