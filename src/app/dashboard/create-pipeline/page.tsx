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
import { ArrowLeft, Plus, X } from "lucide-react";

export default function CreatePipelinePage() {
  const router = useRouter();
  const [pipelineName, setPipelineName] = useState("");
  const [focus, setFocus] = useState("");
  const [schedule, setSchedule] = useState("daily");
  const [deliveryTime, setDeliveryTime] = useState("09:00");
  const [isActive, setIsActive] = useState(true);
  const [emails, setEmails] = useState<string[]>([""]);
  const [subreddits, setSubreddits] = useState<string[]>([""]);
  const [sources, setSources] = useState<string[]>([""]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty values
    const filteredEmails = emails.filter(email => email.trim() !== "");
    const filteredSubreddits = subreddits.filter(subreddit => subreddit.trim() !== "");
    const filteredSources = sources.filter(source => source.trim() !== "");
    
    const pipelineData = {
      pipeline_name: pipelineName,
      pipeline_id: pipelineName.toLowerCase().replace(/\s+/g, "-"), // Generate ID from name
      focus,
      schedule,
      delivery_time: deliveryTime,
      is_active: isActive,
      delivery_email: filteredEmails,
      subreddits: filteredSubreddits,
      source: filteredSources,
    };
    
    console.log("Pipeline data:", pipelineData);
    
    // In a real implementation, you would send this data to your backend
    // For now, we'll just redirect back to the dashboard
    router.push("/dashboard");
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
                <Label htmlFor="pipeline-name">Pipeline Name</Label>
                <Input 
                  id="pipeline-name" 
                  placeholder="My News Pipeline" 
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focus">Focus</Label>
                <Input 
                  id="focus" 
                  placeholder="Technology, Politics, Sports, etc." 
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  required
                />
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
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit">Create Pipeline</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
