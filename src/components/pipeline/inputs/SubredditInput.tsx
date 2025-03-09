import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { cleanSubredditName } from "../utils/validation";

interface SubredditInputProps {
  subreddits: string[];
  onChange: (subreddits: string[]) => void;
  maxSubreddits?: number;
  error?: string | null;
  setError?: (error: string | null) => void;
}

export const SubredditInput = ({
  subreddits,
  onChange,
  maxSubreddits = 10,
  error,
  setError
}: SubredditInputProps) => {
  const [localSubreddits, setLocalSubreddits] = useState<string[]>(subreddits.length ? subreddits : [""]);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalSubreddits(subreddits);
  }, [subreddits, localSubreddits]);
  
  // Check if we've reached the maximum number of non-empty subreddits
  // Only count subreddits that are not the last one (which is the input field)
  const hasMaxSubreddits = localSubreddits.slice(0, -1).filter(s => s.trim() !== "").length >= maxSubreddits;
  
  const handleAddSubreddit = () => {
    if (localSubreddits.length < maxSubreddits) {
      const newSubreddits = [...localSubreddits, ""];
      setLocalSubreddits(newSubreddits);
      onChange(newSubreddits);
    }
  };

  const handleRemoveSubreddit = (index: number) => {
    const newSubreddits = [...localSubreddits];
    newSubreddits.splice(index, 1);
    
    // Ensure we always have at least one input field
    if (newSubreddits.length === 0) {
      newSubreddits.push("");
    }
    
    setLocalSubreddits(newSubreddits);
    onChange(newSubreddits);
    
    if (setError) {
      setError(null);
    }
  };

  const handleSubredditChange = (index: number, value: string) => {
    // Remove "r/" prefix if user types it
    const cleanValue = cleanSubredditName(value);
    
    const newSubreddits = [...localSubreddits];
    newSubreddits[index] = cleanValue;
    setLocalSubreddits(newSubreddits);
    onChange(newSubreddits);
    
    // Clear error when user is typing
    if (error && setError) {
      setError(null);
    }
  };

  const handleSubredditKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const subreddit = localSubreddits[index].trim();
      
      if (subreddit !== '') {
        // Count valid subreddits (excluding the current one being edited)
        const validSubredditsCount = localSubreddits
          .filter((s, i) => i !== index && s.trim() !== "")
          .length;
        
        // Create a new array with all subreddits except the current one
        const newSubreddits = [...localSubreddits.filter((_, i) => i !== index)];
        
        // If we have room for more subreddits
        if (validSubredditsCount < maxSubreddits) {
          // Add the current subreddit as a tag
          newSubreddits.push(subreddit);
          // Add an empty field for the next subreddit
          newSubreddits.push("");
        } else {
          // We're at max subreddits, but still want to add this one
          // Remove the oldest subreddit to make room (first non-empty subreddit)
          const firstNonEmptyIndex = newSubreddits.findIndex(s => s.trim() !== "");
          if (firstNonEmptyIndex !== -1) {
            newSubreddits.splice(firstNonEmptyIndex, 1);
          }
          // Add the current subreddit and an empty field
          newSubreddits.push(subreddit);
          newSubreddits.push("");
        }
        
        setLocalSubreddits(newSubreddits);
        onChange(newSubreddits);
        
        // Focus on the new input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[placeholder="technology"]');
          if (inputs && inputs.length > 0) {
            (inputs[inputs.length - 1] as HTMLInputElement).focus();
          }
        }, 0);
      }
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Subreddits (max {maxSubreddits})</Label>
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
          {localSubreddits.slice(0, -1).map((subreddit, index) => (
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
        
        {/* Show input field */}
        <div className="flex items-center">
          <span className="mr-1 text-red-500 font-medium">r/</span>
          <Input 
            placeholder="technology" 
            value={localSubreddits[localSubreddits.length - 1]}
            onChange={(e) => handleSubredditChange(localSubreddits.length - 1, e.target.value)}
            onKeyDown={(e) => handleSubredditKeyDown(localSubreddits.length - 1, e)}
            className={`flex-1 ${error ? "border-red-500" : ""}`}
            disabled={hasMaxSubreddits}
          />
        </div>
        
        {/* Show message when limit is reached */}
        {hasMaxSubreddits && (
          <p className="text-sm text-muted-foreground">Maximum of {maxSubreddits} subreddits reached.</p>
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};
