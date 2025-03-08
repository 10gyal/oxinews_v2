"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function VerificationAlert() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const error = searchParams.get("error");

  // No message or error to display
  if (!message && !error) {
    return null;
  }

  // Email verification message
  if (message === "check-email") {
    return (
      <div className="max-w-md mx-auto pt-6 px-4">
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50">
          <CheckCircle2 className="text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-400">
            Email verification required
          </AlertTitle>
          <AlertDescription className="text-green-700/90 dark:text-green-400/90">
            We&apos;ve sent a verification link to your email. Please check your inbox and verify your account before logging in.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Error message
  if (error) {
    return (
      <div className="max-w-md mx-auto pt-6 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            {error === "auth_callback_error" 
              ? "There was a problem with authentication. Please try again." 
              : `Error: ${error}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
