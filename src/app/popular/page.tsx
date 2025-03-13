import { Metadata } from "next";
import { PopularPipelineList } from "@/components/popular/PopularPipelineList";
import { Newspaper, TrendingUp, Sparkles, BarChart3 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Popular Content | OxiNews",
  description: "Explore trending content curated by OxiNews - Stay informed with the latest news and insights",
  keywords: "popular content, trending news, curated content, OxiNews",
};

export default function PopularPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium bg-primary/5 border-primary/20">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Trending Now
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">Popular Content</h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Explore trending content curated by OxiNews. Our AI-powered system analyzes and summarizes 
              the most engaging discussions across the web to keep you informed.
            </p>
          </div>
          
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-background rounded-full p-2.5 shadow-sm">
                <Newspaper className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Updated daily</p>
                <p className="text-xs text-muted-foreground">Fresh content every 24 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-primary/5 border-none shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-background rounded-full p-2 shadow-sm">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Trending Topics</p>
                <p className="text-xs text-muted-foreground">Most discussed subjects</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-none shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-background rounded-full p-2 shadow-sm">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Data-Driven Insights</p>
                <p className="text-xs text-muted-foreground">AI-analyzed content</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-none shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="bg-background rounded-full p-2 shadow-sm">
                <Newspaper className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Curated Content</p>
                <p className="text-xs text-muted-foreground">Handpicked for relevance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <PopularPipelineList />
        </TabsContent>
        
        <TabsContent value="trending" className="mt-0">
          <PopularPipelineList />
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <PopularPipelineList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
