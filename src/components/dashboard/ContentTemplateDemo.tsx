"use client";

import { ContentTemplate, ContentItemDetailed } from "./ContentTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Example content data
const exampleContent: ContentItemDetailed = {
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
};

export function ContentTemplateDemo() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Content Template Demo</h1>
      <p className="text-muted-foreground">
        This is a demonstration of how the content template renders structured content from the pipeline_reads table.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Example Pipeline Content</CardTitle>
          <p className="text-sm text-muted-foreground">
            Based on the structure from examples/content.json
          </p>
        </CardHeader>
        <CardContent>
          <ContentTemplate content={exampleContent} />
        </CardContent>
      </Card>
    </div>
  );
}
