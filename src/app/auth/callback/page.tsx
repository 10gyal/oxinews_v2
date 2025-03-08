"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      // First, check if we have a hash fragment with access_token (direct OAuth response)
      if (window.location.hash && window.location.hash.includes('access_token')) {
        try {
          console.log("Found access token in URL hash, setting session...");
          
          // Set the session from the hash
          // The hash contains the access token, so we can use it to set the session
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1) // Remove the # character
          );
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (!accessToken) {
            throw new Error('No access token found in URL hash');
          }
          
          // Set the session with the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            throw error;
          }
          
          if (data?.session) {
            console.log("Session set successfully from URL hash");
            // The redirection will be handled by the AuthProvider
            // when it detects the SIGNED_IN event
            return;
          }
        } catch (error) {
          console.error("Error setting session from URL hash:", error);
          router.push("/login?error=auth_hash_error");
          return;
        }
      }
      
      // If no hash or hash processing failed, try the code flow
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get("code");
      
      if (code) {
        try {
          console.log("Found code in URL, exchanging for session...");
          // Exchange the code for a session
          await supabase.auth.exchangeCodeForSession(code);
          
          // The redirection will be handled by the AuthProvider
          // when it detects the SIGNED_IN event
          console.log("OAuth authentication successful, waiting for redirection...");
          
        } catch (error) {
          console.error("Error handling auth callback:", error);
          router.push("/login?error=auth_callback_error");
        }
      } else if (!window.location.hash) {
        // No code or hash found, redirect to login
        console.log("No authentication code or token found, redirecting to login");
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing authentication...</h1>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
