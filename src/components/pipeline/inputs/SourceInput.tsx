import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface SourceInputProps {
  sources: string[];
  onChange: (sources: string[]) => void;
}

export const SourceInput = ({
  sources,
  onChange
}: SourceInputProps) => {
  const [localSources, setLocalSources] = useState<string[]>(sources.length ? sources : [""]);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalSources(sources);
  }, [sources, localSources]);
  
  const handleAddSource = () => {
    const newSources = [...localSources, ""];
    setLocalSources(newSources);
    onChange(newSources);
  };

  const handleRemoveSource = (index: number) => {
    const newSources = [...localSources];
    newSources.splice(index, 1);
    
    // Ensure we always have at least one input field
    if (newSources.length === 0) {
      newSources.push("");
    }
    
    setLocalSources(newSources);
    onChange(newSources);
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...localSources];
    newSources[index] = value;
    setLocalSources(newSources);
    onChange(newSources);
  };
  
  return (
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
      
      {localSources.map((source, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Input 
            placeholder="https://example.com/rss" 
            value={source}
            onChange={(e) => handleSourceChange(index, e.target.value)}
          />
          {localSources.length > 1 && (
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
  );
};
