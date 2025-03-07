"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import { PipelineConfig } from "@/components/dashboard/PipelineCard";
import { PipelineGrid } from "@/components/dashboard/PipelineGrid";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState<PipelineConfig[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPipelines = async () => {
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
  };

  useEffect(() => {
    fetchPipelines();
  }, [user]);

  const handleCreatePipeline = () => {
    router.push("/dashboard/create-pipeline");
  };
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPipelines();
  };

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
