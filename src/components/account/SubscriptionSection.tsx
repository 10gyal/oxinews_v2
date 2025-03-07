"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { createCheckoutSession, createPortalSession, getSubscriptionStatus, SubscriptionStatus } from "@/lib/stripeService";

interface SubscriptionSectionProps {
  user: User | null;
}

export function SubscriptionSection({ user }: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  
  // Get subscription status
  const isPro = subscriptionStatus?.is_pro || false;
  
  // Fetch subscription status
  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!user) return;
      
      try {
        setIsLoadingStatus(true);
        const status = await getSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        toast.error("Failed to load subscription status");
      } finally {
        setIsLoadingStatus(false);
      }
    }
    
    fetchSubscriptionStatus();
  }, [user]);
  
  // Format expiration date
  const formatExpirationDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle subscription management
  const handleManageSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const portalUrl = await createPortalSession(user.id);
      window.location.href = portalUrl;
    } catch (error: unknown) {
      console.error("Error managing subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to manage subscription";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  // Handle subscription upgrade
  const handleUpgradeSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const checkoutUrl = await createCheckoutSession(user.id);
      window.location.href = checkoutUrl;
    } catch (error: unknown) {
      console.error("Error upgrading subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upgrade subscription";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </div>
            {isLoadingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Badge variant={isPro ? "default" : "outline"}>
                {isPro ? "Pro" : "Free"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStatus ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{isPro ? "Pro Plan" : "Free Plan"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isPro 
                        ? "Full access to all features" 
                        : "Basic access with limited features"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {isPro ? "$11" : "$0"}
                      <span className="text-sm text-muted-foreground"> / month</span>
                    </p>
                  </div>
                </div>
                
                {isPro && subscriptionStatus && (
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Subscription Details</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium capitalize">{subscriptionStatus.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current period ends:</span>
                        <span className="font-medium">{formatExpirationDate(subscriptionStatus.current_period_end)}</span>
                      </div>
                      {subscriptionStatus.cancel_at_period_end && (
                        <div className="mt-2 text-amber-500">
                          <p>Your subscription will end on the period end date.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited pipelines</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm">Content storage</span>
                  </div>
                  {isPro ? (
                    <>
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-sm">Advanced analytics</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span className="text-sm">Advanced analytics</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span className="text-sm">Priority support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isPro ? (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Manage Subscription"
              )}
            </Button>
          ) : (
            <Button
              onClick={handleUpgradeSubscription}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your past invoices and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Pro Plan Subscription</h4>
                    <p className="text-sm text-muted-foreground">
                      Monthly subscription
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$11</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                For complete billing history, please visit the Stripe customer portal.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground">
                No billing history available on the Free plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
