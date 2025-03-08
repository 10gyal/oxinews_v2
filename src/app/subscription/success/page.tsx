"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

function SubscriptionSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifySubscription() {
      try {
        // Get the session ID from the URL
        const sessionId = searchParams.get("session_id");
        
        if (!sessionId) {
          setError("No session ID found");
          setIsVerifying(false);
          return;
        }

        // Wait a moment to allow the webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // No need to refresh the session manually - the auth state listener will handle it
        setIsVerifying(false);
      } catch (error) {
        console.error("Error verifying subscription:", error);
        setError("Failed to verify subscription. Please contact support.");
        setIsVerifying(false);
      }
    }

    if (user) {
      verifySubscription();
    }
  }, [user, searchParams]);

  const handleContinue = () => {
    router.push("/dashboard/account?tab=subscription");
  };

  if (isVerifying) {
    return (
      <div className="container max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Verifying Subscription</CardTitle>
            <CardDescription>
              Please wait while we verify your subscription...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Subscription Error</CardTitle>
            <CardDescription>
              We encountered an issue with your subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-4">
            <p className="mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact our support team.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleContinue}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for subscribing to OxiNews Pro!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-4">
          <p className="mb-4">
            Your account has been upgraded to Pro status. You now have access to all premium features.
          </p>
          <p className="text-sm text-muted-foreground">
            You can manage your subscription at any time from your account settings.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleContinue}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Wrap the component in Suspense to handle useSearchParams
export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container max-w-md py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Please wait while we load your subscription information...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <SubscriptionSuccess />
    </Suspense>
  );
}
