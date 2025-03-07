"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Plus, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export default function CreatePipelinePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pipelineName, setPipelineName] = useState("");
  const [focus, setFocus] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [isActive, setIsActive] = useState(true);
  const [emails, setEmails] = useState<string[]>([""]);
  const [subreddits, setSubreddits] = useState<string[]>([""]);
  const [sources, setSources] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (emails.length < 3) {
      setEmails([...emails, ""]);
    }
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
    setEmailError(null);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
    
    // Clear error when user is typing
    if (emailError) {
      setEmailError(null);
    }
  };

  const handleEmailKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const email = emails[index].trim();
      
      if (email !== '') {
        // Validate email format
        if (!isValidEmail(email)) {
          setEmailError(`Invalid email format: ${email}`);
          return;
        }
        
        if (emails.length < 3) {
          handleAddEmail();
          // Focus on the new input after render
          setTimeout(() => {
            const inputs = document.querySelectorAll('input[type="email"]');
            if (inputs && inputs.length > index + 1) {
              (inputs[index + 1] as HTMLInputElement).focus();
            }
          }, 0);
        }
      }
    }
  };

  const handleAddSubreddit = () => {
    if (subreddits.length < 10) {
      setSubreddits([...subreddits, ""]);
    }
  };

  const handleRemoveSubreddit = (index: number) => {
    const newSubreddits = [...subreddits];
    newSubreddits.splice(index, 1);
    setSubreddits(newSubreddits);
  };

  const handleSubredditChange = (index: number, value: string) => {
    // Remove "r/" prefix if user types it
    const cleanValue = value.startsWith("r/") ? value.substring(2) : value;
    
    const newSubreddits = [...subreddits];
    newSubreddits[index] = cleanValue;
    setSubreddits(newSubreddits);
  };

  const handleSubredditKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const subreddit = subreddits[index].trim();
      
      if (subreddit !== '' && subreddits.length < 10) {
        handleAddSubreddit();
        // Focus on the new input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[placeholder="technology"]');
          if (inputs && inputs.length > index + 1) {
            (inputs[index + 1] as HTMLInputElement).focus();
          }
        }, 0);
      }
    }
  };

  const handleAddSource = () => {
    setSources([...sources, ""]);
  };

  const handleRemoveSource = (index: number) => {
    const newSources = [...sources];
    newSources.splice(index, 1);
    setSources(newSources);
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    setSources(newSources);
  };

  // Check if we've reached the maximum number of non-empty subreddits
  const hasMaxSubreddits = subreddits.filter(s => s.trim() !== "").length >= 10;
  
  // Check if we've reached the maximum number of non-empty emails
  const hasMaxEmails = emails.filter(e => e.trim() !== "").length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
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
    const formattedSubreddits = filteredSubreddits.map(subreddit => 
      subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`
    );
    
    // Generate a unique pipeline_id from the name
    const timestamp = new Date().getTime().toString().slice(-6); // Add timestamp to ensure uniqueness
    const pipelineId = `${pipelineName.toLowerCase().replace(/\s+/g, "-")}-${timestamp}`;
    
    const pipelineData = {
      user_id: user.id,
      pipeline_id: pipelineId,
      pipeline_name: pipelineName,
      focus,
      schedule,
      delivery_time: `${deliveryTime}:00`, // Add seconds to match time format
      is_active: isActive,
      delivery_email: filteredEmails.length > 0 ? filteredEmails : null,
      subreddits: formattedSubreddits.length > 0 ? formattedSubreddits : null,
      source: filteredSources.length > 0 ? filteredSources : null,
    };
    
    try {
      console.log("Submitting pipeline data:", pipelineData);
      
      const { data, error: supabaseError } = await supabase
        .from('pipeline_configs')
        .insert(pipelineData)
        .select();
      
      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        
        // Handle specific error cases
        if (supabaseError.code === '23505') { // Unique constraint violation
          setError("A pipeline with this name already exists. Please choose a different name.");
        } else if (supabaseError.code === '23514') { // Check constraint violation
          setError("Invalid data format. Please check your inputs and try again.");
        } else {
          setError(`Database error: ${supabaseError.message}`);
        }
        
        setIsSubmitting(false);
        return;
      }
      
      console.log("Pipeline created successfully:", data);
      setSuccessMessage("Pipeline created successfully! Redirecting to dashboard...");
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error creating pipeline:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create pipeline";
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
        <h1 className="text-2xl font-bold">Create Pipeline</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Configure the basic settings for your content pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pipeline-name" className="flex items-center">
                  Pipeline Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="pipeline-name" 
                  placeholder="My News Pipeline" 
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  required
                  className={!pipelineName.trim() && error ? "border-red-500" : ""}
                />
                {!pipelineName.trim() && error && (
                  <p className="text-sm text-red-500">Pipeline name is required</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focus" className="flex items-center">
                  Focus <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input 
                  id="focus" 
                  placeholder="Technology, Politics, Sports, etc." 
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  required
                  className={!focus.trim() && error ? "border-red-500" : ""}
                />
                {!focus.trim() && error && (
                  <p className="text-sm text-red-500">Focus is required</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select 
                    value={schedule} 
                    onValueChange={setSchedule}
                  >
                    <SelectTrigger id="schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery-time">Delivery Time</Label>
                  <Input 
                    id="delivery-time" 
                    type="time" 
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is-active" 
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Sources</CardTitle>
              <CardDescription>
                Configure where your content will be sourced from.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Select Content Sources</Label>
                
                <div className="grid grid-cols-4 gap-2">
                  {/* Reddit Card */}
                  <div 
                    className="border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md border-primary bg-primary/5"
                    onClick={() => {}}
                  >
                    <div className="text-center">
                      <p className="font-medium">Reddit</p>
                    </div>
                  </div>
                  
                  {/* X (Twitter) Card - Disabled */}
                  <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
                    <div className="text-center">
                      <p className="font-medium">X (Twitter)</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
                  </div>
                  
                  {/* Telegram Card - Disabled */}
                  <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
                    <div className="text-center">
                      <p className="font-medium">Telegram</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
                  </div>
                  
                  {/* Slack Card - Disabled */}
                  <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
                    <div className="text-center">
                      <p className="font-medium">Slack</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
                  </div>
                  
                  {/* Hacker News Card - Disabled */}
                  <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
                    <div className="text-center">
                      <p className="font-medium">Hacker News</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
                  </div>
                  
                  {/* Discord Card - Disabled */}
                  <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
                    <div className="text-center">
                      <p className="font-medium">Discord</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
                  </div>
                  
                  {/* Custom RSS Card - Disabled */}
                  <div className="border rounded-lg p-2 cursor-not-allowed opacity-60 relative">
                    <div className="text-center">
                      <p className="font-medium">Custom RSS</p>
                    </div>
                    <div className="absolute top-1 right-1 bg-muted text-xs px-1 py-0.5 rounded-sm">Soon</div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Reddit Subreddits Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Subreddits (max 10)</Label>
                  {!hasMaxSubreddits && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddSubreddit}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subreddit
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {subreddits.map((subreddit, index) => (
                      subreddit.trim() !== "" ? (
                        <div key={index} className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full flex items-center gap-1">
                          <span>r/{subreddit}</span>
                          <button 
                            type="button" 
                            className="text-red-600/70 hover:text-red-800 dark:text-red-400/70 dark:hover:text-red-300"
                            onClick={() => handleRemoveSubreddit(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null
                    ))}
                  </div>
                  
                  {/* Show input field only if we haven't reached the maximum */}
                  {!hasMaxSubreddits && (
                    <div className="flex items-center">
                      <Input 
                        placeholder="technology" 
                        value={subreddits[subreddits.length - 1]}
                        onChange={(e) => handleSubredditChange(subreddits.length - 1, e.target.value)}
                        onKeyDown={(e) => handleSubredditKeyDown(subreddits.length - 1, e)}
                        className="flex-1"
                      />
                    </div>
                  )}
                  
                  {/* Show message when limit is reached */}
                  {hasMaxSubreddits && (
                    <p className="text-sm text-muted-foreground">Maximum of 10 subreddits reached.</p>
                  )}
                </div>
              </div>
              
              {/* Custom RSS Sources Section - Only shown if custom RSS is selected */}
              {sources.some(s => s.trim() !== "") && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Custom RSS Sources</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddSource}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Source
                      </Button>
                    </div>
                    
                    {sources.map((source, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input 
                          placeholder="https://example.com/rss" 
                          value={source}
                          onChange={(e) => handleSourceChange(index, e.target.value)}
                        />
                        {sources.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveSource(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>
                Configure where your content will be delivered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Addresses (max 3)</Label>
                  {!hasMaxEmails && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddEmail}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Email
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {emails.map((email, index) => (
                      email.trim() !== "" ? (
                        <div key={index} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1">
                          <span>{email}</span>
                          <button 
                            type="button" 
                            className="text-secondary-foreground/70 hover:text-secondary-foreground"
                            onClick={() => handleRemoveEmail(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null
                    ))}
                  </div>
                  
                  {/* Show input field only if we haven't reached the maximum */}
                  {!hasMaxEmails && (
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={emails[emails.length - 1]}
                      onChange={(e) => handleEmailChange(emails.length - 1, e.target.value)}
                      onKeyDown={(e) => handleEmailKeyDown(emails.length - 1, e)}
                      className={emailError ? "border-red-500" : ""}
                    />
                  )}
                  
                  {/* Show message when limit is reached */}
                  {hasMaxEmails && (
                    <p className="text-sm text-muted-foreground">Maximum of 3 email addresses reached.</p>
                  )}
                  
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
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
                  Creating...
                </>
              ) : (
                'Create Pipeline'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
