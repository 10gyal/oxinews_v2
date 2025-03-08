"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { signInWithOAuth, signOut } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SocialLoginProps {
  isLoading?: boolean;
  isSignUp?: boolean;
}

export function SocialLogin({ isLoading = false, isSignUp = false }: SocialLoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  // Clear error when component is mounted or when isSignUp changes
  useEffect(() => {
    setError(null);
  }, [isSignUp]);
  
  const handleGoogleLogin = async () => {
    try {
      // Prevent multiple clicks
      if (isLoading || localLoading) return;
      
      setLocalLoading(true);
      setError(null);
      
      console.log("Starting Google OAuth flow...");
      
      // Always sign out first to ensure we get the Google consent screen
      // This ensures a fresh authentication flow every time
      console.log("Signing out before Google authentication to ensure consent screen appears");
      try {
        const { error: signOutError } = await signOut();
        if (signOutError) {
          console.error("Error signing out:", signOutError);
        } else {
          console.log("Successfully signed out");
        }
      } catch (signOutError) {
        console.error("Exception during sign out:", signOutError);
      }
      
      console.log("Initiating OAuth with Google...");
      
      try {
        // Call the OAuth function with metadata for signup
        const { data, error } = await signInWithOAuth('google', {
          // Pass metadata to identify this as a signup if needed
          metadata: isSignUp ? { isNewUser: true } : undefined
        });
        
        console.log("OAuth response:", data, error);
        
        if (error) {
          console.error("Google login error:", error.message, error);
          
          // Provide more specific error messages based on error type
          if (error.message.includes("popup")) {
            setError("The login popup was blocked by your browser. Please allow popups for this site and try again.");
          } else if (error.message.includes("network")) {
            setError("Network error. Please check your connection and try again.");
          } else {
            setError(`Failed to sign in with Google: ${error.message}`);
          }
        } else if (data?.url) {
          // If we have a URL, manually redirect to it
          console.log("Manually redirecting to OAuth URL:", data.url);
          window.location.href = data.url;
        } else {
          console.log("OAuth initiated successfully, waiting for redirect...");
          
          // If no URL and no error, something might be wrong
          if (!data) {
            console.warn("No data returned from OAuth initiation");
            setError("Failed to initiate Google authentication. Please try again.");
          }
        }
      } catch (oauthError) {
        console.error("Exception during OAuth initiation:", oauthError);
        setError("Failed to initiate Google authentication. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Google login failed with exception:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            {isSignUp ? "Or sign up with" : "Or continue with"}
          </span>
        </div>
      </div>
      <div className="flex justify-center">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading || localLoading}
          onClick={handleGoogleLogin}
          className="w-full max-w-xs"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            className="mr-2"
          >
            <path 
              fill="#4285F4" 
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
            />
            <path 
              fill="#34A853" 
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
            />
            <path 
              fill="#FBBC05" 
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
            />
            <path 
              fill="#EA4335" 
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
            />
          </svg>
          {isSignUp ? "Sign up with Google" : "Sign in with Google"}
        </Button>
      </div>
    </div>
  );
}
