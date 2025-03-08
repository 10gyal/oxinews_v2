import { Metadata } from "next";
import { PipelineList } from "@/components/shared/content";
import { Newspaper, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Popular Content | OxiNews",
  description: "Explore trending content curated by OxiNews - Stay informed with the latest news and insights",
  keywords: "popular content, trending news, curated content, OxiNews",
};

export default function PopularPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Popular Content</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Explore trending content curated by OxiNews. Our AI-powered system analyzes and summarizes 
            the most engaging discussions across the web to keep you informed.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-lg p-3">
          <Newspaper className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Updated daily with fresh content</span>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <PipelineList isPopular={true} userId="system" />
    </div>
  );
}
