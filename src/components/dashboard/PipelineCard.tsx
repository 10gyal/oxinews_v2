"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, Mail, Globe, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export interface PipelineConfig {
  id: string;
  user_id: string;
  pipeline_id: string;
  pipeline_name: string;
  focus: string;
  schedule: string;
  delivery_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_delivered: string;
  delivery_email: string[] | null;
  last_delivered_date: string | null;
  subreddits: string[] | null;
  source: string[] | null;
  delivery_count: number;
  last_delivered_time: string | null;
}

interface PipelineCardProps {
  pipeline: PipelineConfig;
  onUpdate: () => void;
}

export function PipelineCard({ pipeline, onUpdate }: PipelineCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Format the delivery time to be more readable
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  // Calculate total sources
  const totalSources = 
    (pipeline.subreddits?.length || 0) + 
    (pipeline.source?.length || 0);
  
  // Format last delivered time
  const lastDeliveredFormatted = pipeline.last_delivered 
    ? formatDistanceToNow(new Date(pipeline.last_delivered), { addSuffix: true })
    : 'Never';
  
  // Handle toggle active status
  const handleToggleActive = async () => {
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('pipeline_configs')
        .update({ is_active: !pipeline.is_active })
        .eq('id', pipeline.id);
      
      if (error) throw error;
      
      onUpdate();
    } catch (error) {
      console.error("Error updating pipeline:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handle edit pipeline
  const handleEdit = () => {
    router.push(`/dashboard/edit-pipeline/${pipeline.id}`);
  };
  
  // Handle delete pipeline
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this pipeline?")) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('pipeline_configs')
        .delete()
        .eq('id', pipeline.id);
      
      if (error) throw error;
      
      onUpdate();
    } catch (error) {
      console.error("Error deleting pipeline:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Get schedule badge variant
  const getScheduleBadgeVariant = () => {
    switch (pipeline.schedule) {
      case 'daily':
        return 'default';
      case 'weekly':
        return 'secondary';
      case 'monthly':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2 relative">
        <div className="absolute top-0 right-0 -mt-1 -mr-1">
          <Badge 
            variant={pipeline.is_active ? "default" : "outline"}
            className={cn(
              "rounded-bl-md rounded-tr-md rounded-br-none rounded-tl-none px-3 py-1 font-medium",
              pipeline.is_active ? "bg-primary/90 text-primary-foreground" : "bg-muted/80"
            )}
          >
            {pipeline.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="pt-4">
          <CardTitle className="text-xl truncate" title={pipeline.pipeline_name}>
            {pipeline.pipeline_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2 truncate" title={pipeline.focus}>
            {pipeline.focus}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
            <Badge 
              variant={getScheduleBadgeVariant()} 
              className="capitalize font-medium"
            >
              {pipeline.schedule}
            </Badge>
            <span className="text-xs text-muted-foreground">
              at {formatTime(pipeline.delivery_time)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              {lastDeliveredFormatted}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              {totalSources} {totalSources === 1 ? 'source' : 'sources'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              {pipeline.delivery_email?.length || 0} {(pipeline.delivery_email?.length || 0) === 1 ? 'email' : 'emails'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 col-span-2 bg-muted/50 rounded-md p-2">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              {pipeline.delivery_count} {pipeline.delivery_count === 1 ? 'delivery' : 'deliveries'}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t bg-muted/20">
        <div className="flex items-center gap-2">
          <Switch 
            checked={pipeline.is_active} 
            onCheckedChange={handleToggleActive}
            disabled={isUpdating}
          />
          <span className="text-xs font-medium">
            {pipeline.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEdit}
            disabled={isUpdating}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDelete}
            disabled={isUpdating}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
