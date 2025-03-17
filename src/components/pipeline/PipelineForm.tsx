import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { BasicInfoCard, ContentSourcesCard, DeliverySettingsCard } from "./cards";
import { isValidEmail, cleanSubredditName } from "./utils/validation";
import { PipelineFormData, PipelineData, createPipeline, updatePipeline } from "./utils/api";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

interface PipelineFormProps {
  mode: 'create' | 'edit';
  initialData?: PipelineData;
  userId: string;
  pipelineId?: string;
  onSuccess?: () => void;
}

export const PipelineForm = ({
  mode,
  initialData,
  userId,
  pipelineId,
  onSuccess
}: PipelineFormProps) => {
  const router = useRouter();
  const { isPro, pipelineCount, status } = useAuth();
  const pipelineLimit = isPro ? 3 : 1;
  
  // Form state
  const [pipelineName, setPipelineName] = useState("");
  const [focus, setFocus] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [isActive, setIsActive] = useState(true);
  const [emails, setEmails] = useState<string[]>([""]);
  const [subreddits, setSubreddits] = useState<string[]>([""]);
  const [sources, setSources] = useState<string[]>([""]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Initialize form with data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setPipelineName(initialData.pipeline_name);
      setFocus(initialData.focus);
      setSchedule(initialData.schedule);
      setDeliveryTime(initialData.delivery_time.substring(0, 5)); // Remove seconds
      setIsActive(initialData.is_active);
      setEmails(initialData.delivery_email?.length ? initialData.delivery_email : ['']);
      
      // Process subreddits to remove "r/" prefix if present
      const processedSubreddits = initialData.subreddits?.length 
        ? initialData.subreddits.map(sub => sub.startsWith('r/') ? sub.substring(2) : sub)
        : [''];
      setSubreddits(processedSubreddits);
      
      setSources(initialData.source?.length ? initialData.source : ['']);
    }
  }, [mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setError("You must be logged in to create a pipeline");
      return;
    }
    
    // Basic validation
    if (!pipelineName.trim()) {
      setError("Pipeline name is required");
      return;
    }
    
    if (!focus.trim()) {
      setError("Focus is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    // Filter out empty values
    const filteredEmails = emails.filter(email => email.trim() !== "");
    const filteredSubreddits = subreddits
      .filter(subreddit => subreddit.trim() !== "")
      .map(subreddit => cleanSubredditName(subreddit)); // Clean subreddit names before saving
    const filteredSources = sources.filter(source => source.trim() !== "");
    
    // Validate email format
    for (const email of filteredEmails) {
      if (!isValidEmail(email)) {
        setError(`Invalid email format: ${email}`);
        setIsSubmitting(false);
        return;
      }
    }
    
    const pipelineData: PipelineFormData = {
      pipeline_name: pipelineName,
      focus,
      schedule,
      delivery_time: deliveryTime,
      is_active: isActive,
      delivery_email: filteredEmails.length > 0 ? filteredEmails : null,
      subreddits: filteredSubreddits.length > 0 ? filteredSubreddits : null,
      source: filteredSources.length > 0 ? filteredSources : null,
    };
    
    try {
      let result;
      
      if (mode === 'create') {
        console.log("Creating pipeline:", pipelineData);
        result = await createPipeline(userId, pipelineData);
      } else {
        console.log("Updating pipeline:", pipelineData);
        if (!pipelineId) {
          throw new Error("Pipeline ID is required for updates");
        }
        result = await updatePipeline(userId, pipelineId, pipelineData);
      }
      
      if (result.error) {
        setError(result.error.message);
        setIsSubmitting(false);
        return;
      }
      
      const action = mode === 'create' ? 'created' : 'updated';
      
      if (mode === 'create') {
        setSuccessMessage(`Pipeline ${action} successfully! Please wait patiently as your request is being curated...`);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          // Redirect to content page with the newly created pipeline ID
          if (result.data && result.data.length > 0) {
            router.push(`/dashboard/content?new_pipeline=${result.data[0].id}`);
          } else {
            router.push("/dashboard/content");
          }
        }, 1500);
      } else {
        // For updates, keep the existing behavior
        setSuccessMessage(`Pipeline ${action} successfully! Redirecting to dashboard...`);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect after a short delay to show the success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: unknown) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} pipeline:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} pipeline`;
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{mode === 'create' ? 'Create' : 'Edit'} Pipeline</h1>
      </div>
      
      {/* Show upgrade alert for free tier users who have reached the pipeline limit */}
      {mode === 'create' && !isPro && pipelineCount >= pipelineLimit && (status as string) !== 'loading' && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
          <AlertTitle>Free Tier Limit Reached</AlertTitle>
          <AlertDescription>
            <p>You&apos;ve reached the maximum of 1 pipeline allowed on the free tier.</p>
            <div className="mt-2">
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/50 dark:hover:bg-amber-800">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <BasicInfoCard 
            pipelineName={pipelineName}
            setPipelineName={setPipelineName}
            focus={focus}
            setFocus={setFocus}
            schedule={schedule}
            setSchedule={setSchedule}
            deliveryTime={deliveryTime}
            setDeliveryTime={setDeliveryTime}
            isActive={isActive}
            setIsActive={setIsActive}
            error={error}
          />
          
          <ContentSourcesCard 
            subreddits={subreddits}
            setSubreddits={setSubreddits}
            sources={sources}
            setSources={setSources}
          />
          
          <DeliverySettingsCard 
            emails={emails}
            setEmails={setEmails}
            emailError={emailError}
            setEmailError={setEmailError}
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {(error.includes("Free tier") || error.includes("Upgrade to Pro")) && (
                  <div className="mt-2">
                    <Link href="/pricing">
                      <Button variant="outline" size="sm" className="bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900">
                        View Pricing
                      </Button>
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {successMessage && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (mode === 'create' && !isPro && pipelineCount >= pipelineLimit)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Pipeline' : 'Update Pipeline'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
