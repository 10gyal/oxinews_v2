import React from "react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentItem } from "./types";
import { hasDetailedStructure } from "./ContentViewUtils";
import { ContentTemplate, ContentItemDetailed } from "@/components/dashboard/ContentTemplate";

interface ContentItemRendererProps {
  item: ContentItem;
  index: number;
}

export function ContentItemRenderer({ item, index }: ContentItemRendererProps) {
  const contentId = `content-item-${index}`;
  
  // Check if the item has the detailed structure
  if (hasDetailedStructure(item)) {
    // Use the ContentTemplate for detailed content
    return (
      <div id={contentId}>
        <ContentTemplate 
          content={item as unknown as ContentItemDetailed} 
        />
      </div>
    );
  } 
  
  // Fallback for legacy content format
  return (
    <Card id={contentId} className="overflow-hidden border-2">
      <CardHeader className="pb-3 bg-muted/30">
        {item.title && (
          <CardTitle className="text-xl">{item.title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {item.description && (
          <p className="text-muted-foreground mb-4">{item.description}</p>
        )}
        {item.url && (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-500 hover:underline"
          >
            Read more <ChevronRight className="h-3 w-3 ml-1" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
