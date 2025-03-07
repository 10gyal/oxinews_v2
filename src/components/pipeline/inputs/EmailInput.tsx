import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { isValidEmail } from "../utils/validation";

interface EmailInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  maxEmails?: number;
  error?: string | null;
  setError?: (error: string | null) => void;
}

export const EmailInput = ({
  emails,
  onChange,
  maxEmails = 3,
  error,
  setError
}: EmailInputProps) => {
  const [localEmails, setLocalEmails] = useState<string[]>(emails.length ? emails : [""]);
  
  // Update local state when prop changes
  useEffect(() => {
    if (JSON.stringify(emails) !== JSON.stringify(localEmails)) {
      setLocalEmails(emails.length ? emails : [""]);
    }
  }, [emails]);
  
  // Check if we've reached the maximum number of non-empty emails
  // Only count emails that are not the last one (which is the input field)
  const hasMaxEmails = localEmails.slice(0, -1).filter(e => e.trim() !== "").length >= maxEmails;
  
  const handleAddEmail = () => {
    if (localEmails.length < maxEmails) {
      const newEmails = [...localEmails, ""];
      setLocalEmails(newEmails);
      onChange(newEmails);
    }
  };

  const handleRemoveEmail = (index: number) => {
    const newEmails = [...localEmails];
    newEmails.splice(index, 1);
    
    // Ensure we always have at least one input field
    if (newEmails.length === 0) {
      newEmails.push("");
    }
    
    setLocalEmails(newEmails);
    onChange(newEmails);
    
    if (setError) {
      setError(null);
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...localEmails];
    newEmails[index] = value;
    setLocalEmails(newEmails);
    onChange(newEmails);
    
    // Clear error when user is typing
    if (error && setError) {
      setError(null);
    }
  };

  const handleEmailKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const email = localEmails[index].trim();
      
      if (email !== '') {
        // Validate email format
        if (!isValidEmail(email)) {
          if (setError) {
            setError(`Invalid email format: ${email}`);
          }
          return;
        }
        
        // Count valid emails (excluding the current one being edited)
        const validEmailsCount = localEmails
          .filter((e, i) => i !== index && e.trim() !== "")
          .length;
        
        // Create a new array with all emails except the current one
        const newEmails = [...localEmails.filter((_, i) => i !== index)];
        
        // If we have room for more emails
        if (validEmailsCount < maxEmails) {
          // Add the current email as a tag
          newEmails.push(email);
          // Add an empty field for the next email
          newEmails.push("");
        } else {
          // We're at max emails, but still want to add this one
          // Remove the oldest email to make room (first non-empty email)
          const firstNonEmptyIndex = newEmails.findIndex(e => e.trim() !== "");
          if (firstNonEmptyIndex !== -1) {
            newEmails.splice(firstNonEmptyIndex, 1);
          }
          // Add the current email and an empty field
          newEmails.push(email);
          newEmails.push("");
        }
        
        setLocalEmails(newEmails);
        onChange(newEmails);
        
        // Focus on the new input after render
        setTimeout(() => {
          const inputs = document.querySelectorAll('input[type="email"]');
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
        <Label>Email Addresses (max {maxEmails})</Label>
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
          {localEmails.slice(0, -1).map((email, index) => (
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
        
        {/* Show input field */}
        <Input 
          type="email" 
          placeholder="email@example.com" 
          value={localEmails[localEmails.length - 1]}
          onChange={(e) => handleEmailChange(localEmails.length - 1, e.target.value)}
          onKeyDown={(e) => handleEmailKeyDown(localEmails.length - 1, e)}
          className={error ? "border-red-500" : ""}
          disabled={hasMaxEmails}
        />
        
        {/* Show message when limit is reached */}
        {hasMaxEmails && (
          <p className="text-sm text-muted-foreground">Maximum of {maxEmails} email addresses reached.</p>
        )}
        
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
};
