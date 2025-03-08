"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href);
      const code = searchParams.get("code");
      
      if (code) {
        try {
          // Exchange the code for a session
          await supabase.auth.exchangeCodeForSession(code);
          
          // The redirection will be handled by the AuthProvider
          // when it detects the SIGNED_IN event
          console.log("OAuth authentication successful, waiting for redirection...");
          
        } catch (error) {
          console.error("Error handling auth callback:", error);
          router.push("/login?error=auth_callback_error");
        }
      } else {
        // No code found, redirect to login
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
