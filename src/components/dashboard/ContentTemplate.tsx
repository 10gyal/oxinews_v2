"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { ThumbsDown, ThumbsUp, AlertTriangle, ExternalLink, MessageSquare, ArrowUpRight, FileText, Link } from "lucide-react";

// Define interfaces for the content structure
interface Source {
  subreddit: string;
  postId: string;
  postTitle: string;
  url: string;
  commentCount: number;
  upvotes: number;
}

interface KeyPoint {
  point: string;
  sentiment: "positive" | "negative" | "mixed" | "neutral";
  subreddits: string[];
}

interface RelevantLink {
  title: string;
  url: string;
  mentions: number;
}

export interface ContentItemDetailed {
  title: string;
  summary: string;
  sources: Source[];
  keyPoints: KeyPoint[];
  relevantLinks: RelevantLink[];
  overallSentiment: "positive" | "negative" | "mixed" | "neutral";
}

interface ContentTemplateProps {
  content: ContentItemDetailed;
}

export function ContentTemplate({ content }: ContentTemplateProps) {
  return (
    <div className="space-y-6">
      <ContentHeader title={content.title} sentiment={content.overallSentiment} />
      <Card className="shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="bg-muted/20 pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div id="summary" className="mb-8 bg-card/50 p-4 rounded-lg border">
            <p className="text-muted-foreground leading-relaxed">{content.summary}</p>
          </div>
          
          <div className="space-y-6">
            <KeyPointsSection keyPoints={content.keyPoints} id="key-points" />
            <SourcesSection sources={content.sources} id="sources" />
            <RelevantLinksSection links={content.relevantLinks} id="relevant-links" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Header component with title and sentiment badge
function ContentHeader({ 
  title, 
  sentiment 
}: { 
  title: string; 
  sentiment: "positive" | "negative" | "mixed" | "neutral" 
}) {
  const getSentimentDetails = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return { 
          icon: <ThumbsUp className="h-4 w-4 mr-1" />, 
          color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          gradientFrom: "from-green-50",
          gradientTo: "to-transparent"
        };
      case "negative":
        return { 
          icon: <ThumbsDown className="h-4 w-4 mr-1" />, 
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          gradientFrom: "from-red-50",
          gradientTo: "to-transparent"
        };
      case "mixed":
        return { 
          icon: <AlertTriangle className="h-4 w-4 mr-1" />, 
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
          gradientFrom: "from-amber-50",
          gradientTo: "to-transparent"
        };
      default:
        return { 
          icon: null, 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          gradientFrom: "from-gray-50",
          gradientTo: "to-transparent"
        };
    }
  };

  const { icon, color, gradientFrom, gradientTo } = getSentimentDetails(sentiment);

  return (
    <div className={`p-4 rounded-lg border bg-gradient-to-r ${gradientFrom} ${gradientTo} dark:bg-gradient-to-r dark:from-gray-900/20 dark:to-transparent`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Badge variant="outline" className={`flex items-center px-3 py-1 ${color}`}>
          {icon}
          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
        </Badge>
      </div>
    </div>
  );
}


// Key Points section
function KeyPointsSection({ keyPoints, id }: { keyPoints: KeyPoint[]; id: string }) {
  if (!keyPoints || keyPoints.length === 0) return null;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case "mixed":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return null;
    }
  };

  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-900/50";
      case "negative":
        return "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50";
      case "mixed":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50";
      default:
        return "bg-card/50";
    }
  };

  return (
    <div id={id}>
      <Accordion type="single" collapsible defaultValue="key-points" className="border-t pt-2">
        <AccordionItem value="key-points" className="border-none">
          <AccordionTrigger className="py-2 hover:bg-muted/30 px-3 rounded-md transition-colors">
            <h3 className="text-base font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-primary" />
              Key Points
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {keyPoints.map((point, index) => (
                <div 
                  key={index} 
                  className={`flex gap-3 p-3 rounded-lg border ${getSentimentClass(point.sentiment)}`}
                >
                  <div className="mt-1 flex-shrink-0">{getSentimentIcon(point.sentiment)}</div>
                  <div>
                    <p className="leading-relaxed">{point.point}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {point.subreddits.map((subreddit, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-background/80">
                          {subreddit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Sources section
function SourcesSection({ sources, id }: { sources: Source[]; id: string }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div id={id}>
      <Accordion type="single" collapsible className="border-t pt-2">
        <AccordionItem value="sources" className="border-none">
          <AccordionTrigger className="py-2 hover:bg-muted/30 px-3 rounded-md transition-colors">
            <h3 className="text-base font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Sources
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {sources.map((source, index) => (
                <div key={index} className="space-y-3 p-3 border rounded-lg bg-card/50">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-lg">{source.postTitle}</h3>
                    <Badge variant="outline" className="ml-2 bg-primary/5 text-primary">
                      r/{source.subreddit}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center bg-muted/50 px-2 py-1 rounded-full">
                      <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary" />
                      {source.commentCount} comments
                    </div>
                    <div className="flex items-center bg-muted/50 px-2 py-1 rounded-full">
                      <ArrowUpRight className="h-3.5 w-3.5 mr-1 text-primary" />
                      {source.upvotes} upvotes
                    </div>
                  </div>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center w-fit px-3 py-1 bg-primary/5 rounded-full transition-colors hover:bg-primary/10"
                  >
                    View on Reddit <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

// Relevant Links section
function RelevantLinksSection({ links, id }: { links: RelevantLink[]; id: string }) {
  if (!links || links.length === 0) return null;

  return (
    <div id={id}>
      <Accordion type="single" collapsible className="border-t pt-2">
        <AccordionItem value="relevant-links" className="border-none">
          <AccordionTrigger className="py-2 hover:bg-muted/30 px-3 rounded-md transition-colors">
            <h3 className="text-base font-medium flex items-center">
              <Link className="h-4 w-4 mr-2 text-primary" />
              Relevant Links
            </h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {links.map((link, index) => (
                <div key={index} className="p-3 border rounded-lg bg-card/50 flex items-center justify-between">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    {link.title} <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                  <Badge variant="outline" className="ml-2 bg-primary/5">
                    {link.mentions} {link.mentions === 1 ? 'mention' : 'mentions'}
                  </Badge>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
