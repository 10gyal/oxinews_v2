import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SubredditInput } from "../inputs";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

interface ContentSourcesCardProps {
  subreddits: string[];
  setSubreddits: (subreddits: string[]) => void;
  sources: string[];
  setSources: (sources: string[]) => void;
}

export const ContentSourcesCard = ({
  subreddits,
  setSubreddits,
  sources,
  setSources
}: ContentSourcesCardProps) => {
  const { isPro } = useAuth();
  const maxSubreddits = isPro ? 30 : 10;
  // Ensure "reddit" is always included in the sources array
  useEffect(() => {
    if (!sources.includes("reddit")) {
      setSources([...sources.filter(s => s.trim() !== ""), "reddit"]);
    }
  }, [sources, setSources]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Content Sources
          {!isPro && (
            <Badge variant="secondary" className="ml-2">
              Free Tier: Max 10 sources
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure where your content will be sourced from.
          {!isPro && (
            <span className="block mt-1 text-sm">
              <Link href="/pricing" className="text-primary hover:underline">
                Upgrade to Pro
              </Link> for unlimited sources.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Select Content Sources</Label>
          
          <div className="grid grid-cols-4 gap-2">
            {/* Reddit Card */}
            <div 
              className="border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md border-primary bg-primary/5"
              onClick={() => {
                // Add "reddit" to the sources array if it's not already there
                if (!sources.includes("reddit")) {
                  setSources([...sources.filter(s => s.trim() !== ""), "reddit"]);
                }
              }}
            >
              <div className="text-center">
                <p className="font-medium">Reddit</p>
              </div>
            </div>
            
            {/* X (Twitter) Card - Disabled */}
            <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
              <div className="text-center">
                <p className="font-medium">X (Twitter)</p>
              </div>
              <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
            </div>
            
            {/* Telegram Card - Disabled */}
            <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
              <div className="text-center">
                <p className="font-medium">Telegram</p>
              </div>
              <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
            </div>
            
            {/* Slack Card - Disabled */}
            <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
              <div className="text-center">
                <p className="font-medium">Slack</p>
              </div>
              <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
            </div>
            
            {/* Hacker News Card - Disabled */}
            <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
              <div className="text-center">
                <p className="font-medium">Hacker News</p>
              </div>
              <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
            </div>
            
            {/* Discord Card - Disabled */}
            <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
              <div className="text-center">
                <p className="font-medium">Discord</p>
              </div>
              <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
            </div>
            
            {/* Custom RSS Card - Disabled */}
            <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
              <div className="text-center">
                <p className="font-medium">Custom RSS</p>
              </div>
              <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Reddit Subreddits Section */}
        <SubredditInput 
          subreddits={subreddits}
          onChange={setSubreddits}
          maxSubreddits={maxSubreddits}
        />
        
        {/* Custom RSS Sources Section removed as requested */}
      </CardContent>
    </Card>
  );
};
