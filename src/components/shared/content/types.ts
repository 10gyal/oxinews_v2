export interface ContentItem {
  title?: string;
  description?: string;
  url?: string;
  summary?: string;
  sources?: Array<{ title: string; url: string }>;
  keyPoints?: Array<string>;
  relevantLinks?: Array<{ title: string; url: string }>;
  overallSentiment?: string;
  [key: string]: string | number | boolean | object | undefined;
}

export interface PipelineRead {
  id: number;
  created_at: string;
  title: string;
  pipeline_name: string;
  content: ContentItem[];
  user_id: string;
  pipeline_id: string;
  issue: number;
}

export interface ContentViewProps {
  pipelineId: string;
  contentId: number;
  isPopular?: boolean;
  userId?: string;
}
