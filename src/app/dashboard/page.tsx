"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PipelineConfig } from "@/components/dashboard/PipelineCard";
import { PipelineGrid } from "@/components/dashboard/PipelineGrid";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { EmptyDashboard } from "@/components/dashboard/EmptyDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, status, redirectToLogin } = useAuth();
  const [pipelines, setPipelines] = useState<PipelineConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchPipelines = useCallback(async (retryCount = 0) => {
    if (!user || status === 'loading') {
      setIsLoading(status === 'loading');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify session is still valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Session expired or invalid');
      }
      
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
      
      setPipelines([]);
      setError(err instanceof Error ? err : new Error('Failed to fetch pipelines'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, status]);

  useEffect(() => {
    // Handle authentication state
    if (status === 'unauthenticated') {
      redirectToLogin();
      return;
    }

    // Only fetch pipelines if user is available and auth is not in loading state
    if (user && status === 'authenticated' && !isInitialized) {
      console.log('Dashboard: Auth is authenticated, initializing pipeline fetch');
      setIsInitialized(true);
      fetchPipelines();
    } else if (status === 'loading') {
      console.log('Dashboard: Auth is still loading, waiting...');
      // Reset loading state to show skeletons
      setIsLoading(true);
    }
  }, [user, status, fetchPipelines, redirectToLogin, isInitialized]);

  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsInitialized(false); // Reset initialization state to force a fresh fetch
    fetchPipelines(0);
  };

  // Show loading state when authentication is still being established
  if (status === 'loading') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-md"></div>
            <div className="h-5 w-96 bg-muted animate-pulse rounded-md"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
            <div className="h-10 w-36 bg-muted animate-pulse rounded-md"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-full overflow-hidden animate-pulse border rounded-lg shadow-sm">
              <div className="p-6 pb-2 relative">
                <div className="absolute top-0 right-0 -mt-1 -mr-1">
                  <div className="h-7 w-20 bg-muted rounded-bl-md rounded-tr-md rounded-br-none rounded-tl-none"></div>
                </div>
                <div className="pt-4 space-y-3">
                  <div className="h-7 w-3/4 bg-muted rounded-md"></div>
                  <div className="h-4 w-1/2 bg-muted rounded-md"></div>
                </div>
              </div>
              
              <div className="px-6 pb-2">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="h-10 w-full bg-muted rounded-md"></div>
                  <div className="h-10 w-full bg-muted rounded-md"></div>
                  <div className="h-10 w-full bg-muted rounded-md"></div>
                  <div className="h-10 w-full bg-muted rounded-md"></div>
                  <div className="h-10 w-full col-span-2 bg-muted rounded-md"></div>
                </div>
              </div>
              
              <div className="p-4 border-t flex justify-between">
                <div className="h-6 w-20 bg-muted rounded-md"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-muted rounded-md"></div>
                  <div className="h-8 w-8 bg-muted rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show empty state when there are no pipelines and not loading
  const showEmptyState = !isLoading && pipelines && pipelines.length === 0;

  return (
    <div className="space-y-8">
      {/* Onboarding overlay for first-time users */}
      <OnboardingOverlay />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your Pipelines</h1>
          <p className="text-muted-foreground">
            Create and manage your content pipelines to receive personalized content
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="h-10 w-10 rounded-full shadow-sm transition-all duration-200 hover:shadow"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={handleCreatePipeline}
            size="lg"
            className="shadow-sm transition-all duration-200 hover:shadow"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Pipeline
          </Button>
        </div>
      </div>
      
      {showEmptyState ? (
        <EmptyDashboard />
      ) : (
        <PipelineGrid 
          pipelines={pipelines} 
          isLoading={isLoading} 
          error={error} 
          onRefresh={fetchPipelines}
        />
      )}
    </div>
  );
}
