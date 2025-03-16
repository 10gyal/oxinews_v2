"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/stripeService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login?redirect=/pricing");
      return;
    }

    setIsLoading(true);
    
    try {
      const checkoutUrl = await createCheckoutSession(user.id);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that works best for you and your content needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Free Plan</CardTitle>
            <CardDescription>For casual users</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Basic content pipelines</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Limited content storage</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Standard support</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <CardDescription>For power users</CardDescription>
              </div>
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold">$11</span>
              <span className="text-muted-foreground"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Unlimited pipelines</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Unlimited content storage</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                <span>Priority support</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="text-center mt-12 text-muted-foreground">
        <p>
          All plans include a 14-day money-back guarantee. No questions asked.
        </p>
        <p className="mt-2">
          Need a custom plan for your team? <a href="#" className="underline">Contact us</a>
        </p>
      </div>
    </div>
  );
}
