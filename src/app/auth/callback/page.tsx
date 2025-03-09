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
        
        if (code) {
          try {
            // Exchange the code for a session
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              throw error;
            }
            
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
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              redirectToDashboard();
            } else {
              throw new Error("Failed to establish session");
            }
            
          } catch (error: unknown) {
            console.error("Error handling auth callback:", error);
            
            // Handle the error based on its type
            if (error instanceof AuthError) {
              setError(error.message);
            } else if (error instanceof Error) {
              setError(error.message);
            } else {
              setError("Authentication failed. Please try again.");
            }
            
            // After 3 seconds, redirect to login
            setTimeout(() => {
              router.push("/login?error=auth_callback_error");
            }, 3000);
          }
        } else {
          // No code found, redirect to login
          console.error("No code found in callback URL");
          setError("Authentication failed. No authorization code received.");
          
          // After 3 seconds, redirect to login
          setTimeout(() => {
            redirectToLogin();
          }, 3000);
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
        {error ? (
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
