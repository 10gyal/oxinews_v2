"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  ArrowLeft, 
  Calendar, 
  RefreshCcw, 
  FileText, 
  Search,
  ArrowUpRight,
  Clock,
  Newspaper,
  Loader2,
  Filter,
  ListFilter,
  ChevronRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SYSTEM_USER_ID } from "@/lib/constants";


interface PipelineRead {
  id: number;
  created_at: string;
  title: string;
  issue?: number;
}

interface PopularContentListProps {
  pipelineId: string;
}

export function PopularContentList({ pipelineId }: PopularContentListProps) {
  const router = useRouter();
  const [pipelineName, setPipelineName] = useState<string>("");
  const [contentItems, setContentItems] = useState<PipelineRead[] | null>(null);
  const [filteredItems, setFilteredItems] = useState<PipelineRead[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "compact">("card");

  const fetchPipelineData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the pipeline name and id
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipeline_configs')
        .select('pipeline_name, pipeline_id')
        .eq('id', pipelineId)
        .eq('user_id', SYSTEM_USER_ID)
        .single();
      
      if (pipelineError) throw new Error(pipelineError.message);
      if (!pipelineData) throw new Error('Pipeline not found');
      
      setPipelineName(pipelineData.pipeline_name);
      
      // Then, get the pipeline reads (only id, title, created_at)
      const { data: readsData, error: readsError } = await supabase
        .from('pipeline_reads')
        .select('id, title, created_at, issue')
        .eq('pipeline_id', pipelineData.pipeline_id)
        .eq('user_id', SYSTEM_USER_ID)
        .order('created_at', { ascending: false });
      
      if (readsError) throw new Error(readsError.message);
      
      setContentItems(readsData as PipelineRead[]);
      setFilteredItems(readsData as PipelineRead[]);
    } catch (err) {
      console.error("Error fetching pipeline data:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipeline data'));
    } finally {
      setIsLoading(false);
    }
  }, [pipelineId]);

  useEffect(() => {
    if (pipelineId) {
      fetchPipelineData();
    }
  }, [pipelineId, fetchPipelineData]);

  // Filter content items when search query changes
  useEffect(() => {
    if (!contentItems) return;
    
    if (!searchQuery) {
      setFilteredItems(contentItems);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = contentItems.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) || 
      (item.issue && item.issue.toString().includes(query))
    );
    
    setFilteredItems(filtered);
  }, [contentItems, searchQuery]);

  const handleBack = () => {
    router.push('/popular');
  };

  const handleRefresh = () => {
    fetchPipelineData();
  };

  const handleContentClick = (contentId: number, title: string) => {
    // Use the pipeline name and title in the URL
    const encodedPipelineName = encodeURIComponent(pipelineName);
    const encodedTitle = encodeURIComponent(title || `untitled-${contentId}`);
    router.push(`/popular/${encodedPipelineName}/${encodedTitle}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      
      <Skeleton className="h-12 w-full rounded-lg" />
      
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-[100px]" />
            </div>
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Popular
        </Button>
        
        {renderSkeletons()}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4 group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Popular
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Error Loading Content</h1>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
        
        <Alert variant="destructive" className="animate-in fade-in-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} className="group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Popular
        </Button>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <ListFilter className="h-3.5 w-3.5" />
                <span>View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="flex items-center gap-2" 
                onClick={() => setViewMode("card")}
              >
                <span className={`h-2 w-2 rounded-full ${viewMode === "card" ? "bg-primary" : "bg-muted"}`}></span>
                <span>Card View</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2" 
                onClick={() => setViewMode("compact")}
              >
                <span className={`h-2 w-2 rounded-full ${viewMode === "compact" ? "bg-primary" : "bg-muted"}`}></span>
                <span>Compact View</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 gap-1.5"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="h-3.5 w-3.5" />
            )}
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-background rounded-full p-3 shadow-sm">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{pipelineName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {contentItems?.length || 0} {contentItems?.length === 1 ? 'issue' : 'issues'}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Select an item to view details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-4 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select 
            className="bg-background border rounded-md px-3 py-2 text-sm"
            onChange={(e) => {
              const sortedItems = [...(filteredItems || [])];
              switch (e.target.value) {
                case "newest":
                  sortedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  break;
                case "oldest":
                  sortedItems.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                  break;
                case "issue":
                  sortedItems.sort((a, b) => (b.issue || 0) - (a.issue || 0));
                  break;
              }
              setFilteredItems(sortedItems);
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="issue">Issue Number</option>
          </select>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 mb-6">
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          {(!filteredItems || filteredItems.length === 0) ? (
            <div className="rounded-xl border bg-card p-12 text-center shadow-sm animate-in fade-in-50">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No content found</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery 
                    ? "No content matches your search criteria. Try a different search term."
                    : "No content available for this pipeline yet. Check back later."}
                </p>
              </div>
            </div>
          ) : viewMode === "card" ? (
            <ScrollArea className="h-full">
              <div className="space-y-6">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group cursor-pointer hover:shadow-md transition-all overflow-hidden border"
                    onClick={() => handleContentClick(item.id, item.title)}
                  >
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent p-4 pb-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">
                            {item.title || 'Untitled Content'}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-full">
                              Issue #{item.issue || 'Unknown'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getRelativeTime(item.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(item.created_at)}
                          </div>
                          <div>{formatTime(item.created_at)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        View the complete details and analysis for this issue. This content includes key insights, 
                        trending topics, and relevant discussions from across the web.
                      </p>
                    </CardContent>
                    <CardFooter className="p-0 border-t">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between rounded-none h-11 px-4 text-primary"
                      >
                        <span className="text-sm font-medium">View details</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="space-y-2 border rounded-lg overflow-hidden">
              {filteredItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer ${
                    index !== filteredItems.length - 1 ? 'border-b' : ''
                  }`}
                  onClick={() => handleContentClick(item.id, item.title)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="rounded-full w-8 h-8 flex items-center justify-center p-0">
                      {item.issue || '?'}
                    </Badge>
                    <div>
                      <h3 className="font-medium">{item.title || 'Untitled Content'}</h3>
                      <p className="text-xs text-muted-foreground">{getRelativeTime(item.created_at)}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <div className="rounded-xl border bg-card p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-muted p-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Recent Content</h3>
              <p className="text-muted-foreground max-w-md">
                This tab will show content published in the last 7 days.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="archived" className="mt-0">
          <div className="rounded-xl border bg-card p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Archived Content</h3>
              <p className="text-muted-foreground max-w-md">
                This tab will show archived content that is no longer actively updated.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
