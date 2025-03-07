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

  const handleAddEmail = () => {
    if (emails.length < 3) {
      setEmails([...emails, ""]);
    }
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleAddSubreddit = () => {
    setSubreddits([...subreddits, ""]);
  };

  const handleRemoveSubreddit = (index: number) => {
    const newSubreddits = [...subreddits];
    newSubreddits.splice(index, 1);
    setSubreddits(newSubreddits);
  };

  const handleSubredditChange = (index: number, value: string) => {
    const newSubreddits = [...subreddits];
    newSubreddits[index] = value;
    setSubreddits(newSubreddits);
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

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
      subreddits: filteredSubreddits.length > 0 ? filteredSubreddits : null,
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
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>
                Configure where your content will be delivered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Addresses (max 3)</Label>
                  {emails.length < 3 && (
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
                
                {emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                    />
                    {emails.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveEmail(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Subreddits</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleAddSubreddit}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Subreddit
                  </Button>
                </div>
                
                {subreddits.map((subreddit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input 
                      placeholder="technology" 
                      value={subreddit}
                      onChange={(e) => handleSubredditChange(index, e.target.value)}
                    />
                    {subreddits.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveSubreddit(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Other Sources</Label>
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
