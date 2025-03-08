"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PipelineConfig } from "@/components/dashboard/PipelineCard";
import { PipelineGrid } from "@/components/dashboard/PipelineGrid";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [pipelines, setPipelines] = useState<PipelineConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPipelines = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('pipeline_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) throw new Error(supabaseError.message);
      
      setPipelines(data);
    } catch (err) {
      console.error("Error fetching pipelines:", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipelines'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch pipelines if user is available and auth is not in loading state
    if (user && !isAuthLoading) {
      fetchPipelines();
    } else if (!isAuthLoading && !user) {
      // If auth is not loading and there's no user, redirect to login
      console.log("Not authenticated, redirecting to login page");
      router.push("/login");
    }
  }, [user, isAuthLoading, fetchPipelines, router]);

  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPipelines();
  };


  // Show loading state when authentication is still being established
  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Pipelines</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your content pipelines
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-full">
              <div className="p-6 border rounded-lg bg-card">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-5 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-5 w-full col-span-2 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If not authenticated, show a message
  if (!user && !isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please log in to view your pipelines.
        </p>
        <p className="text-xs text-muted-foreground mb-2">Redirecting to login page...</p>
        <Button onClick={() => router.push("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Your Pipelines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your content pipelines
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreatePipeline}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>
        </div>
      </div>
      
      <PipelineGrid 
        pipelines={pipelines} 
        isLoading={isLoading} 
        error={error} 
        onRefresh={fetchPipelines}
      />
    </div>
  );
}
