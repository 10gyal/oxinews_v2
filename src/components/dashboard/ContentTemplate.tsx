"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThumbsDown, ThumbsUp, AlertTriangle, ExternalLink, MessageSquare, ArrowUpRight } from "lucide-react";

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
      <ContentSummary summary={content.summary} />
      <KeyPointsSection keyPoints={content.keyPoints} />
      <SourcesSection sources={content.sources} />
      <RelevantLinksSection links={content.relevantLinks} />
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
        return { icon: <ThumbsUp className="h-4 w-4 mr-1" />, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
      case "negative":
        return { icon: <ThumbsDown className="h-4 w-4 mr-1" />, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" };
      case "mixed":
        return { icon: <AlertTriangle className="h-4 w-4 mr-1" />, color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" };
      default:
        return { icon: null, color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    }
  };

  const { icon, color } = getSentimentDetails(sentiment);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Badge variant="outline" className={`flex items-center ${color}`}>
        {icon}
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Sentiment
      </Badge>
    </div>
  );
}

// Summary component
function ContentSummary({ summary }: { summary: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}

// Key Points section
function KeyPointsSection({ keyPoints }: { keyPoints: KeyPoint[] }) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keyPoints.map((point, index) => (
            <div key={index} className="flex gap-3">
              <div className="mt-1">{getSentimentIcon(point.sentiment)}</div>
              <div>
                <p>{point.point}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {point.subreddits.map((subreddit, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {subreddit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sources section
function SourcesSection({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sources.map((source, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{source.postTitle}</h3>
                <Badge variant="outline" className="ml-2">
                  {source.subreddit}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground gap-4">
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {source.commentCount} comments
                </div>
                <div className="flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {source.upvotes} upvotes
                </div>
              </div>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline flex items-center"
              >
                View on Reddit <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              {index < sources.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Relevant Links section
function RelevantLinksSection({ links }: { links: RelevantLink[] }) {
  if (!links || links.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Relevant Links</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={index} className="flex items-center justify-between">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                {link.title} <ExternalLink className="h-3 w-3 ml-1" />
              </a>
              <Badge variant="outline" className="ml-2">
                {link.mentions} {link.mentions === 1 ? 'mention' : 'mentions'}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
