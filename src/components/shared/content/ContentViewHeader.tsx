import React from "react";
import { ArrowLeft, RefreshCcw, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContentViewHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  isPopular?: boolean;
}

export function ContentViewHeader({
  onBack,
  onRefresh,
  onShare,
  onPrint,
  isPopular = false,
}: ContentViewHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="group">
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Content List
      </Button>
      
      <div className="flex items-center gap-2">
        {isPopular && onShare && onPrint && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onShare}
                    className="h-8 w-8"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={onPrint}
                    className="h-8 w-8"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print this content</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
