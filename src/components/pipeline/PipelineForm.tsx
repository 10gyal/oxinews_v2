import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { BasicInfoCard, ContentSourcesCard, DeliverySettingsCard } from "./cards";
import { isValidEmail, formatSubreddits } from "./utils/validation";
import { PipelineFormData, PipelineData, createPipeline, updatePipeline } from "./utils/api";

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
    const filteredSubreddits = subreddits.filter(subreddit => subreddit.trim() !== "");
    const filteredSources = sources.filter(source => source.trim() !== "");
    
    // Validate email format
    for (const email of filteredEmails) {
      if (!isValidEmail(email)) {
        setError(`Invalid email format: ${email}`);
        setIsSubmitting(false);
        return;
      }
    }
    
    // Add "r/" prefix to subreddits if not already present
    const formattedSubreddits = formatSubreddits(filteredSubreddits);
    
    const pipelineData: PipelineFormData = {
      pipeline_name: pipelineName,
      focus,
      schedule,
      delivery_time: deliveryTime,
      is_active: isActive,
      delivery_email: filteredEmails.length > 0 ? filteredEmails : null,
      subreddits: formattedSubreddits.length > 0 ? formattedSubreddits : null,
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
      setSuccessMessage(`Pipeline ${action} successfully! Redirecting to dashboard...`);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
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
              <AlertDescription>{error}</AlertDescription>
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
              disabled={isSubmitting}
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
