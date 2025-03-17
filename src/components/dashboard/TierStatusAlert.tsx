"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown } from "lucide-react";
import Link from "next/link";

export function TierStatusAlert() {
  const { isPro, pipelineCount } = useAuth();
  
  // Don't show anything for pro users
  if (isPro) {
    return null;
  }
  
  // Don't show anything if user has no pipelines yet
  if (pipelineCount === 0) {
    return null;
  }
  
  const remainingPipelines = Math.max(0, 1 - pipelineCount);
  const hasReachedLimit = pipelineCount >= 1;
  
  return (
    <Alert className={hasReachedLimit 
      ? "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
      : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
    }>
      {hasReachedLimit ? (
        <AlertCircle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
      ) : (
        <Crown className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
      )}
      
      <AlertTitle>
        {hasReachedLimit 
          ? "Free Tier Limit Reached" 
          : `Free Tier: ${pipelineCount}/1 Pipeline Used`
        }
      </AlertTitle>
      
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          {hasReachedLimit ? (
            <p>You&apos;ve reached the maximum of 1 pipeline allowed on the free tier.</p>
          ) : (
            <p>{remainingPipelines} pipeline remaining in free tier.</p>
          )}
        </div>
        
        <Link href="/pricing">
          <Button 
            variant="outline" 
            size="sm" 
            className={hasReachedLimit 
              ? "bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/50 dark:hover:bg-amber-800"
              : "bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/50 dark:hover:bg-blue-800"
            }
          >
            Upgrade to Pro
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
