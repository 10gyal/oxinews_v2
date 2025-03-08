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
        console.log("Loading timeout reached, forcing exit from loading state");
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
      console.log("Cannot fetch pipelines: No user available");
      setIsLoading(false); // Ensure loading state is false if no user
      return;
    }
    
    try {
      console.log("Setting loading state to true");
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching pipelines for user:", user.id);
      
      // Log the Supabase client state
      console.log("Supabase auth state:", 
        await supabase.auth.getSession().then(res => 
          `Session exists: ${!!res.data.session}, User ID: ${res.data.session?.user?.id || 'none'}`
        )
      );
      
      // Force a small delay to ensure the loading state is visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error: supabaseError } = await supabase
        .from('pipeline_configs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw new Error(supabaseError.message);
      }
      
      console.log("Pipelines fetched successfully:", data?.length || 0);
      console.log("Pipeline data:", data);
      setPipelines(data);
    } catch (err) {
      console.error("Error fetching pipelines:", err);
      
      // Retry logic - attempt up to 3 retries with exponential backoff
      if (retryCount < 3) {
        console.log(`Retrying fetch (attempt ${retryCount + 1}/3)...`);
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
      console.log("Setting loading state to false");
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    console.log("Dashboard useEffect triggered");
    console.log("Auth state:", { 
      user: user ? `ID: ${user.id}` : 'null', 
      status
    });
    
    // Only fetch pipelines if user is available and auth is not in loading state
    if (user && status === 'authenticated') {
      console.log("User authenticated, fetching pipelines...");
      fetchPipelines();
    } else if (status === 'unauthenticated') {
      // If auth is not loading and there's no user, redirect to login
      console.log("Not authenticated, redirecting to login page");
      redirectToLogin();
    }
  }, [user, status, fetchPipelines, redirectToLogin]);

  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };
  
  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    setIsRefreshing(true);
    
    // Force a new fetch with no retries
    fetchPipelines(0);
  };


  // Show loading state when authentication is still being established
  if (status === 'loading') {
    console.log("Rendering auth loading state");
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
    console.log("Rendering not authenticated state");
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

  console.log("Rendering main dashboard with loading state:", isLoading);
  
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
