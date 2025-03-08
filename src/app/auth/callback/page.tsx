"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";
import { isDevelopmentEnvironment, createEnvironmentUrl } from "@/lib/environment";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
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
          const loginUrl = createEnvironmentUrl(`/login?error=${encodeURIComponent(errorParam)}`);
          if (typeof window !== 'undefined') {
            window.location.href = loginUrl;
          } else {
            router.push(`/login?error=${encodeURIComponent(errorParam)}`);
          }
        }, 3000);
        return;
      }
      
      if (code) {
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
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
              if (metadata.isNewUser && data.user) {
                // You could update user profile here if needed
                console.log("New user signed up with Google");
              }
            } catch (e) {
              console.error("Error parsing metadata:", e);
            }
          }
          
          console.log("OAuth authentication successful, waiting for redirection...");
          console.log("Environment:", isDevelopmentEnvironment() ? "development" : "production");
          
          // The redirection will be handled by the AuthProvider
          // when it detects the SIGNED_IN event
          
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
            const loginUrl = createEnvironmentUrl("/login?error=auth_callback_error");
            if (typeof window !== 'undefined') {
              window.location.href = loginUrl;
            } else {
              router.push("/login?error=auth_callback_error");
            }
          }, 3000);
        }
      } else {
        // No code found, redirect to login
        console.error("No code found in callback URL");
        setError("Authentication failed. No authorization code received.");
        // After 3 seconds, redirect to login
        setTimeout(() => {
          const loginUrl = createEnvironmentUrl("/login");
          if (typeof window !== 'undefined') {
            window.location.href = loginUrl;
          } else {
            router.push("/login");
          }
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [router]);

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
