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
  const { user, status, redirectToLogin } = useAuth();
  const [pipelines, setPipelines] = useState<PipelineConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false to avoid showing loading state prematurely
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add a timeout reference to automatically exit loading state
  const loadingTimeoutRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && isLoading) {
      // Set a timeout to exit loading state after 10 seconds
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        // If we don't have pipelines data, set it to an empty array to show empty state
        if (!pipelines) {
          setPipelines([]);
        }
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, pipelines]);

  const fetchPipelines = useCallback(async (retryCount = 0) => {
    if (!user) {
      setIsLoading(false); // Ensure loading state is false if no user
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('pipeline_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      setPipelines(data);
    } catch (err) {
      // Retry logic - attempt up to 3 retries with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        
        setTimeout(() => {
          fetchPipelines(retryCount + 1);
        }, delay);
        
        return;
      }
      
      // If all retries fail, set pipelines to empty array to show empty state
      setPipelines([]);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipelines'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch pipelines if user is available and auth is not in loading state
    if (user && status === 'authenticated') {
      fetchPipelines();
    } else if (status === 'unauthenticated') {
      // If auth is not loading and there's no user, redirect to login
      redirectToLogin();
    }
  }, [user, status, fetchPipelines, redirectToLogin]);

  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Force a new fetch with no retries
    fetchPipelines(0);
  };

  // Show loading state when authentication is still being established
  if (status === 'loading') {
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
  if (!user && status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
        <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please log in to view your pipelines.
        </p>
        <p className="text-xs text-muted-foreground mb-2">Redirecting to login page...</p>
        <Button onClick={() => redirectToLogin()}>
          Go to Login
        </Button>
      </div>
    );
  }

  // If we have a user but no pipelines yet, show empty state
  if (user && !pipelines && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Your Pipelines</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your content pipelines
            </p>
          </div>
          <Button onClick={handleCreatePipeline}>
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">No Pipelines Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first pipeline to get started.
          </p>
          <Button onClick={handleCreatePipeline}>
            Create Pipeline
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6" ref={loadingTimeoutRef}>
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
