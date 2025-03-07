# Content Template Documentation

This document explains the structure and usage of the content template system for rendering pipeline content in OxiNews.

## Overview

The content template is designed to render rich, structured content from the `pipeline_reads` table. It provides a consistent and visually appealing way to display content items with various sections like summaries, key points, sources, and relevant links.

## Content Structure

The content template expects data in the following structure:

```typescript
interface ContentItemDetailed {
  title: string;                  // Title of the content
  summary: string;                // Summary or description
  sources: Source[];              // Array of source objects
  keyPoints: KeyPoint[];          // Array of key points with sentiment
  relevantLinks: RelevantLink[];  // Array of relevant links
  overallSentiment: "positive" | "negative" | "mixed" | "neutral"; // Overall sentiment
}

interface Source {
  subreddit: string;      // Name of the subreddit
  postId: string;         // ID of the post
  postTitle: string;      // Title of the post
  url: string;            // URL to the post
  commentCount: number;   // Number of comments
  upvotes: number;        // Number of upvotes
}

interface KeyPoint {
  point: string;          // The key point text
  sentiment: "positive" | "negative" | "mixed" | "neutral"; // Sentiment of the point
  subreddits: string[];   // Array of subreddits where this point was mentioned
}

interface RelevantLink {
  title: string;          // Title of the link
  url: string;            // URL of the link
  mentions: number;       // Number of mentions
}
```

## Example Content

Here's an example of content that follows this structure:

```json
{
  "title": "Finding Success in Newsletter Writing Without Comparison",
  "summary": "The discussion emphasizes the importance of emotional freedom in newsletter writing by advocating for a perspective shift in how writers view success and comparison. It posits that true fulfillment comes from contributing without expectations and detaches self-worth from the reactions of others. This approach fosters creativity and lowers anxiety related to competition and societal pressures, suggesting that success is subjective and can be redefined through personal values and intrinsic worth.",
  "sources": [
    {
      "subreddit": "r/newsletters",
      "postId": "1j17bsh",
      "postTitle": "Success without comparison or expectations",
      "url": "https://www.reddit.com/r/newsletters/comments/1j17bsh/success_without_comparison_or_expectations/",
      "commentCount": 2,
      "upvotes": 2
    }
  ],
  "keyPoints": [
    {
      "point": "Writers should focus on intrinsic value and personal satisfaction in their work rather than external validation.",
      "sentiment": "positive",
      "subreddits": [
        "r/newsletters"
      ]
    },
    {
      "point": "Comparison to others can damage emotional well-being and should be avoided for better creative expression.",
      "sentiment": "mixed",
      "subreddits": [
        "r/newsletters"
      ]
    }
  ],
  "relevantLinks": [
    {
      "title": "What Steve Jobs Taught me About Sales",
      "url": "https://abitgamey.substack.com/p/what-steve-jobs-taught-me-about-sales",
      "mentions": 1
    },
    {
      "title": "Three Ways Nietzsche Shapes My Thinking",
      "url": "https://abitgamey.substack.com/p/three-ways-nietzsche-shapes-my-thinking",
      "mentions": 1
    },
    {
      "title": "Uniqueness is Our Power",
      "url": "https://abitgamey.substack.com/p/uniqueness-is-our-power",
      "mentions": 1
    }
  ],
  "overallSentiment": "positive"
}
```

## Usage in Database

When storing content in the `pipeline_reads` table, ensure that the `content` column contains an array of objects that follow this structure. The `PipelineContentView` component will automatically detect and render content items with this structure using the `ContentTemplate` component.

## Backward Compatibility

The system maintains backward compatibility with the legacy content format. If a content item doesn't have the detailed structure, it will fall back to the basic rendering that displays title, description, and URL.

## Demo

A demo of the content template is available at `/dashboard/content/demo`. This demo shows how the template renders the example content and can be used as a reference for creating new content.

## Components

The content template system consists of the following components:

1. `ContentTemplate.tsx` - The main component that renders the content
2. `ContentTemplateDemo.tsx` - A demo component that shows how the template looks with example data
3. `PipelineContentView.tsx` - The component that displays pipeline content and uses the ContentTemplate

## Styling

The content template uses the application's theme and styling system, including:

- Cards for different sections
- Color-coded sentiment indicators (green for positive, red for negative, amber for mixed)
- Responsive design for all screen sizes
- Icons for different types of content

## Future Enhancements

Potential future enhancements for the content template system:

1. Add support for more content types (videos, images, etc.)
2. Implement filtering and sorting options for key points and sources
3. Add more interactive elements like collapsible sections
4. Implement a search function for content items
