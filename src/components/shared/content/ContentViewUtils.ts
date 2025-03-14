import { ContentItem } from './types';

/**
 * Formats a date string into a human-readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Checks if a content item has the detailed structure
 */
export const hasDetailedStructure = (item: ContentItem): boolean => {
  return !!(
    item.title && 
    item.summary && 
    Array.isArray(item.sources) && 
    Array.isArray(item.keyPoints) && 
    Array.isArray(item.relevantLinks) && 
    item.overallSentiment
  );
};
