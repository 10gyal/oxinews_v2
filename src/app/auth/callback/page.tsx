"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { redirectToLogin, redirectToDashboard } = useAuth();
  const isProcessing = useRef(false);

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
          // Log the current state before exchange
          console.log("Starting code exchange...");
          
          // Exchange the code for a session
          const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error("Error exchanging code for session:", exchangeError);
            throw exchangeError;
          }
          
          console.log("Code exchange successful:", data);
          
          // Check for metadata in the URL (passed as query params)
          const metadataParam = searchParams.get("metadata");
          if (metadataParam) {
            try {
              const metadata = JSON.parse(metadataParam);
              console.log("OAuth metadata received:", metadata);
              
              // If this is a new user signup, we might want to update user profile
              if (metadata.isNewUser) {
                console.log("New user signed up with Google");
              }
            } catch (e) {
              console.error("Error parsing metadata:", e);
            }
          }
          
          console.log("OAuth authentication successful");
          
          // Wait for a short time to ensure the auth state listener has processed the session
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if we have a valid session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error getting session:", sessionError);
            throw sessionError;
          }
          
          if (session) {
            console.log("Session established successfully");
            redirectToDashboard();
          } else {
            throw new Error("Failed to establish session");
          }
          
        } catch (error) {
          console.error("Error handling auth callback:", error);
          
          // Handle the error based on its type
          if (error instanceof AuthError) {
            console.error("Auth error details:", {
              message: error.message,
              status: error.status,
              name: error.name,
            });
            
            // Don't show the code verifier error to the user as it's usually transient
            if (error.message.includes("code verifier")) {
              console.warn("Code verifier error detected - this is usually transient");
              // Don't set error state for this specific error
              // Just wait for the auth to complete
            } else {
              setError(error.message);
            }
          } else if (error instanceof Error) {
            // Don't show the code verifier error to the user
            if (error.message.includes("code verifier")) {
              console.warn("Code verifier error detected - this is usually transient");
            } else {
              setError(error.message);
            }
          } else {
            setError("Authentication failed. Please try again.");
          }
          
          // For code verifier errors, don't redirect immediately as they often resolve themselves
          if (error instanceof Error && error.message.includes("code verifier")) {
            console.log("Waiting for auth to complete despite code verifier error...");
            // Don't redirect, just wait for the auth to complete
          } else {
            // After 3 seconds, redirect to login for other errors
            setTimeout(() => {
              router.push("/login?error=auth_callback_error");
            }, 3000);
          }
        }
      } finally {
        isProcessing.current = false;
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
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
