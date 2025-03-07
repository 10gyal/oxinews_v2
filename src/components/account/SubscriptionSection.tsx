"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface SubscriptionSectionProps {
  user: User | null;
}

export function SubscriptionSection({ user }: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user metadata
  const userMetadata = user?.user_metadata || {};
  const isPro = userMetadata.is_pro === true;
  
  // Handle subscription management
  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      // This would typically call a server endpoint to create a Stripe Checkout or Customer Portal session
      // For now, we'll just show a toast message
      toast.info("Subscription management will be available soon");
    } catch (error: unknown) {
      console.error("Error managing subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to manage subscription";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription upgrade
  const handleUpgradeSubscription = async () => {
    setIsLoading(true);
    
    try {
      // This would typically call a server endpoint to create a Stripe Checkout session
      // For now, we'll just show a toast message
      toast.info("Subscription upgrade will be available soon");
    } catch (error: unknown) {
      console.error("Error upgrading subscription:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upgrade subscription";
      toast.error(errorMessage);
    } finally {
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
            <Badge variant={isPro ? "default" : "outline"}>
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                    {isPro ? "$9.99" : "$0"}
                    <span className="text-sm text-muted-foreground"> / month</span>
                  </p>
                </div>
              </div>
              
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
                    <p className="font-medium">$9.99</p>
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
      
      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPro ? (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">
                        Expires 12/2025
                      </p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
              </div>
              <div className="flex justify-center">
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
                    "Manage Payment Methods"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 text-center">
              <p className="text-muted-foreground">
                No payment methods available on the Free plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
