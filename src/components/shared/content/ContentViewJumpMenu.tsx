import React from "react";
import { Menu, X, List, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContentItem } from "./types";

interface ContentViewJumpMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  contentItems: ContentItem[];
  onJumpToSection: (sectionId: string) => void;
}

export function ContentViewJumpMenu({
  isOpen,
  onToggle,
  contentItems,
  onJumpToSection,
}: ContentViewJumpMenuProps) {
  return (
    <>
      {/* Floating Jump Navigation Toggle Button - Hidden on mobile, visible on md screens and up */}
      <div className="fixed right-0 top-1/3 z-50 hidden md:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="default" 
                size="default" 
                className="rounded-l-md rounded-r-none shadow-lg px-3 py-6 bg-primary hover:bg-primary/90 transition-all duration-200"
                onClick={onToggle}
              >
                <div className="flex flex-col items-center">
                  {isOpen ? (
                    <>
                      <X className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">Close</span>
                    </>
                  ) : (
                    <>
                      <Menu className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">Jump</span>
                    </>
                  )}
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isOpen ? 'Close navigation' : 'Open content navigation'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Slide-in Jump Navigation - Hidden on mobile, visible on md screens and up */}
      <div 
        className={`fixed right-0 top-1/3 transform transition-transform duration-300 ease-in-out z-40 hidden md:block ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ marginTop: '40px' }}
      >
        <Card className="w-64 shadow-lg rounded-l-md rounded-r-none border-r-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <List className="h-4 w-4 mr-2" />
              Jump to Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {contentItems.map((item, index) => {
                  // Only create navigation buttons for items with titles
                  if (item.title) {
                    const contentId = `content-item-${index}`;
                    return (
                      <Button 
                        key={index}
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left" 
                        onClick={() => onJumpToSection(contentId)}
                      >
                        <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title}
                        </span>
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
