"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTierProps {
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
}

function PricingTier({ name, price, description, features, ctaText, ctaLink, popular = false }: PricingTierProps) {
  return (
    <Card className={`flex flex-col h-full ${popular ? 'border-primary shadow-lg' : 'border-border shadow-md'}`}>
      <CardHeader className={`pb-8 ${popular ? 'pt-8' : 'pt-6'}`}>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <div className="mt-4 flex items-baseline text-5xl font-extrabold">
          {price}
          {price !== "$0" && <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>}
        </div>
        <CardDescription className="mt-4 text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className={`flex-shrink-0 h-5 w-5 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`}>
                {feature.included ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="ml-2 text-muted-foreground">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-6">
        <Link href={ctaLink} className="w-full">
          <Button 
            className="w-full" 
            variant={popular ? "default" : "outline"}
          >
            {ctaText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export function PricingSection() {
  const freeTierFeatures = [
    { text: "Perspective-based sentiment analysis", included: true },
    { text: "One pipeline with up to 10 sources", included: true },
    { text: "Choose your preferred delivery schedule", included: true },
    { text: "Delivery to one email address", included: true },
    { text: "Ideal for casual readers", included: true },
  ];

  const proTierFeatures = [
    { text: "Perspective-based sentiment analysis", included: true },
    { text: "Three pipelines, each with up to 10 sources", included: true },
    { text: "Additional pipelines at just $5 each", included: true },
    { text: "Deliver summaries to up to three email addresses", included: true },
    { text: "Set your preferred delivery schedule", included: true },
    { text: "Ideal for professionals needing timely public sentiments", included: true },
  ];

  return (
    <section id="pricing" className="py-20 bg-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Obviously, we recommend the Pro Tier XD
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingTier 
            name="Free"
            price="$0"
            description="No credit card required"
            features={freeTierFeatures}
            ctaText="Get Started"
            ctaLink="/signup"
          />
          
          <PricingTier 
            name="Pro"
            price="$11"
            description="Unlock advanced features"
            features={proTierFeatures}
            ctaText="Upgrade to Pro"
            ctaLink="/signup"
            popular={true}
          />
        </div>
      </div>
    </section>
  );
}
