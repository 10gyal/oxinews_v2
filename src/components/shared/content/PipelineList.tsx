"use client";

import { useState, useEffect, useCallback } from "react";
import { PipelineCard } from "./PipelineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCcw, Search, Filter, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface SimplePipeline {
  id: string;
  pipeline_name: string;
}

interface PipelineListProps {
  isPopular?: boolean;
  userId?: string;
  showDemoButton?: boolean;
}

export function PipelineList({ isPopular = false, userId, showDemoButton = false }: PipelineListProps) {
  // For popular content, always use 'system' as the user ID
  // For user content, default to 'system' if userId is undefined
  const effectiveUserId = isPopular ? 'system' : (userId || 'system');
  const router = useRouter();
  const [pipelines, setPipelines] = useState<SimplePipeline[] | null>(null);
  const [filteredPipelines, setFilteredPipelines] = useState<SimplePipeline[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest");

  const fetchPipelines = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('pipeline_configs')
        .select('id, pipeline_name, created_at')
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setPipelines(data);
      setFilteredPipelines(data);
    } catch (err) {
      console.error("Error fetching pipelines:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipelines'));
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId]);

  useEffect(() => {
    if (effectiveUserId) {
      fetchPipelines();
    }
  }, [effectiveUserId, fetchPipelines]);

  // Filter and sort pipelines when dependencies change
  useEffect(() => {
    if (!pipelines) return;
    
    let result = [...pipelines];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(pipeline => 
        pipeline.pipeline_name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "newest":
        // Already sorted by created_at desc from the query
        break;
      case "oldest":
        result = [...result].reverse();
        break;
      case "alphabetical":
        result = [...result].sort((a, b) => 
          a.pipeline_name.localeCompare(b.pipeline_name)
        );
        break;
    }
    
    setFilteredPipelines(result);
  }, [pipelines, searchQuery, sortOrder]);

  const handleRefresh = () => {
    fetchPipelines();
  };

  const handleViewDemo = () => {
    router.push('/dashboard/content/demo');
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">{isPopular ? 'Popular Pipelines' : 'Your Pipelines'}</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load {isPopular ? 'popular' : ''} content: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{isPopular ? 'Popular Pipelines' : 'Your Pipelines'}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pipelines..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "newest" | "oldest" | "alphabetical")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        renderSkeletons()
      ) : !filteredPipelines || filteredPipelines.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-12 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No pipelines found</h3>
              <p className="text-muted-foreground max-w-md">
                {searchQuery 
                  ? "No pipelines match your search criteria. Try a different search term."
                  : isPopular 
                    ? "No popular content available at the moment. Check back later."
                    : "No pipelines found. Create a pipeline in the dashboard first."}
              </p>
            </div>
          </div>
          
          {showDemoButton && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleViewDemo}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                View Content Template Demo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPipelines.map((pipeline) => (
              <PipelineCard 
                key={pipeline.id} 
                id={pipeline.id} 
                name={pipeline.pipeline_name}
                isPopular={isPopular}
                userId={userId}
              />
            ))}
          </div>
          
          {showDemoButton && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={handleViewDemo}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                View Content Template Demo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
