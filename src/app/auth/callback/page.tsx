"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase, checkSession } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { redirectToLogin, redirectToDashboard } = useAuth();
  const isProcessing = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      if (isProcessing.current) return;
      isProcessing.current = true;

      try {
        const { searchParams } = new URL(window.location.href);
        const code = searchParams.get("code");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        
        // Handle error from OAuth provider
        if (errorParam) {
          console.error("OAuth error:", errorParam, errorDescription);
          setError(errorDescription || "Authentication failed. Please try again.");
          
          // After 3 seconds, redirect to login
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorParam)}`);
          }, 3000);
          return;
        }
        
        if (!code) {
          // No code found, redirect to login
          console.error("No code found in callback URL");
          setError("Authentication failed. No authorization code received.");
          
          // After 3 seconds, redirect to login
          setTimeout(() => {
            redirectToLogin();
          }, 3000);
          return;
        }

        try {
          // Get OAuth info from localStorage
          let oauthTimestamp = null;
          let oauthProvider = null;
          
          if (typeof window !== 'undefined') {
            try {
              oauthTimestamp = window.localStorage.getItem('oxinews-oauth-timestamp');
              oauthProvider = window.localStorage.getItem('oxinews-oauth-provider');
              
              if (oauthTimestamp) {
                console.log("Found OAuth timestamp:", oauthTimestamp);
              }
              
              if (oauthProvider) {
                console.log("Found OAuth provider:", oauthProvider);
              }
            } catch (e) {
              console.error('Error retrieving OAuth info:', e);
            }
          }
          
          
          // Try to exchange the code for a session
          let exchangeSuccess = false;
          
          try {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              // Log the error but don't throw it - we'll try to recover
              console.log("Note: Code exchange had an issue:", exchangeError.message);
              
              if (exchangeError.message.includes("code verifier")) {
                console.log("This is a PKCE verification issue - will attempt session recovery");
              }
            } else {
              exchangeSuccess = true;
            }
          } catch (exchangeError) {
            // Catch and suppress the error
            console.log("Caught exchange error:", exchangeError);
            console.log("Will attempt session recovery");
          }
          
          // Check for metadata in the URL (passed as query params)
          const metadataParam = searchParams.get("metadata");
          if (metadataParam) {
            try {
              const metadata = JSON.parse(metadataParam);
              
              // If this is a new user signup, we might want to update user profile
              if (metadata.isNewUser) {
                console.log("New user signed up with Google");
              }
            } catch (e) {
              console.error("Error parsing metadata:", e);
            }
          }
          
          // If code exchange was successful, we can proceed more quickly
          if (exchangeSuccess) {
            console.log("Code exchange was successful, checking for session immediately");
            const session = await checkSession();
            if (session) {
              console.log("Session found immediately after successful code exchange");
              console.log("Auth callback: Redirecting to dashboard after successful authentication");
              redirectToDashboard();
              return;
            }
          }
          
          // Wait for a short time to ensure the auth state listener has processed the session
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Try to get the session multiple times with increasing delays
          let session = await checkSession();
          
          if (!session) {
            console.log("No session found on first attempt, waiting and trying again...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            session = await checkSession();
          }
          
          if (!session) {
            console.log("No session found on second attempt, waiting longer and trying again...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            session = await checkSession();
          }
          
          if (session) {
            // console.log("Session established successfully:", {
            //   user: session.user.email,
            //   expires: new Date(session.expires_at! * 1000).toISOString()
            // });
            
            // Clean up OAuth info
            if (typeof window !== 'undefined') {
              try {
                window.localStorage.removeItem('oxinews-oauth-timestamp');
                window.localStorage.removeItem('oxinews-oauth-provider');
              } catch (e) {
                console.error('Error cleaning up OAuth info:', e);
              }
            }
            
            console.log("Auth callback: Redirecting to dashboard after successful authentication");
            redirectToDashboard();
          } else {
            throw new Error("Failed to establish session after multiple attempts");
          }
          
        } catch (error) {
          // Only log non-PKCE errors as errors
          if (!(error instanceof Error) || !error.message.includes("code verifier")) {
            console.error("Error handling auth callback:", error);
          }
          
          // Handle the error based on its type
          if (error instanceof AuthError) {
            // Don't show the code verifier error to the user
            if (!error.message.includes("code verifier")) {
              setError(error.message);
            }
          } else if (error instanceof Error) {
            // Don't show the code verifier error to the user
            if (!error.message.includes("code verifier")) {
              setError(error.message);
            }
          } else {
            setError("Authentication failed. Please try again.");
          }
          
          // For code verifier errors, try one more time to get the session
          if (error instanceof Error && error.message.includes("code verifier")) {
            console.log("Attempting one final session recovery...");
            
            try {
              await new Promise(resolve => setTimeout(resolve, 3000));
              const session = await checkSession();
              
              if (session) {
                console.log("Final recovery attempt successful");
                redirectToDashboard();
                return;
              }
            } catch (finalError) {
              console.log("Final recovery attempt failed:", finalError);
            }
          }
          
          // After 3 seconds, redirect to login for errors
          setTimeout(() => {
            router.push("/login?error=auth_callback_error");
          }, 3000);
        }
      } finally {
        isProcessing.current = false;
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, redirectToLogin, redirectToDashboard]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-md w-full px-4">
        {error && !error.includes("code verifier") ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <h1 className="text-2xl font-semibold mb-4">Completing authentication...</h1>
        <p className="text-muted-foreground">
          {isLoading 
            ? "Please wait while we complete the authentication process." 
            : "Redirecting you to the dashboard..."}
        </p>
      </div>
    </div>
  );
}
