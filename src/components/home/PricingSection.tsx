"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { Check, X, Sparkles, CreditCard, ArrowRight } from "lucide-react";

interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingTierProps {
  name: string;
  price: string;
  yearlyPrice?: string;
  description: string;
  features: PricingFeature[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
  isYearly: boolean;
  badge?: string;
}

function PricingTier({ 
  name, 
  price, 
  yearlyPrice, 
  description, 
  features, 
  ctaText, 
  ctaLink, 
  popular = false,
  isYearly,
  badge
}: PricingTierProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: popular ? 0.2 : 0 }}
    >
      <Card className={`flex flex-col h-full relative overflow-hidden ${
        popular 
          ? 'border-primary shadow-xl bg-gradient-to-b from-background to-primary/5' 
          : 'border-border shadow-md hover:shadow-lg transition-shadow duration-300'
      }`}>
        {/* Popular Badge */}
        {popular && (
          <div className="absolute top-0 right-0">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
              MOST POPULAR
            </div>
          </div>
        )}
        
        {/* Custom Badge */}
        {badge && (
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              {badge}
            </Badge>
          </div>
        )}
        
        <CardHeader className={`pb-6 ${popular ? 'pt-10' : 'pt-8'}`}>
          <CardTitle className="text-2xl font-bold flex items-center">
            {name}
            {popular && <Sparkles size={18} className="ml-2 text-primary" />}
          </CardTitle>
          
          <div className="mt-4 flex items-baseline">
            <span className="text-5xl font-extrabold">
              {isYearly && yearlyPrice ? yearlyPrice : price}
            </span>
            {(isYearly && yearlyPrice ? yearlyPrice : price) !== "$0" && (
              <span className="ml-1 text-xl font-medium text-muted-foreground">
                /{isYearly ? 'year' : 'month'}
              </span>
            )}
          </div>
          
          {isYearly && price !== "$0" && (
            <div className="mt-2 text-sm text-primary font-medium">
              Save 20% with annual billing
            </div>
          )}
          
          <CardDescription className="mt-4 text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <motion.li 
                key={index} 
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
              >
                <div className={`flex-shrink-0 h-5 w-5 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`}>
                  {feature.included ? (
                    <Check size={20} className="h-5 w-5" />
                  ) : (
                    <X size={20} className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 ${feature.highlight ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {feature.text}
                  {feature.highlight && (
                    <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px]">
                      NEW
                    </Badge>
                  )}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        
        <CardFooter className="pt-6">
          <Link href={ctaLink} className="w-full">
            <Button 
              className={`w-full group ${popular ? 'bg-primary hover:bg-primary/90' : ''}`}
              variant={popular ? "default" : "outline"}
              size="lg"
            >
              <span>{ctaText}</span>
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
        
        {/* Decorative corner accent for popular plan */}
        {popular && (
          <div className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/20 to-transparent opacity-50 transform rotate-45 translate-x-16 translate-y-16"></div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  
  const freeTierFeatures = [
    { text: "Perspective-based sentiment analysis", included: true },
    { text: "One pipeline with up to 10 sources", included: true },
    { text: "Choose your preferred delivery schedule", included: true },
    { text: "Delivery to one email address", included: true },
    { text: "Advanced sentiment tracking", included: true },
  ];

  const proTierFeatures = [
    { text: "Everything in Free tier", included: true },
    { text: "Three pipelines, each with up to 10 sources", included: true },
    { text: "Additional pipelines at just $5 each", included: true },
    { text: "Deliver summaries to up to multiple email addresses", included: true },
    { text: "24/7 support", included: true },
    { text: "Early access to new features", included: true },
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)/5_1px,transparent_1px),linear-gradient(180deg,var(--primary)/5_1px,transparent_1px)] bg-[size:70px_70px] opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
            <CreditCard size={14} className="mr-1 text-primary" />
            <span>Simple Tiers</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose what works best for you!
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
            <div className="relative">
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                id="billing-toggle"
              />
              <Label htmlFor="billing-toggle" className="sr-only">Toggle billing period</Label>
            </div>
            <span className={`text-sm ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              Yearly
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20 text-[10px]">
                SAVE 20%
              </Badge>
            </span>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <PricingTier 
            name="Free"
            price="$0"
            description="Perfect for getting started"
            features={freeTierFeatures}
            ctaText="Get Started"
            ctaLink="/signup"
            isYearly={isYearly}
            badge="No Credit Card"
          />
          
          <PricingTier 
            name="Pro"
            price="$11"
            yearlyPrice="$105"
            description="Unlock advanced features"
            features={proTierFeatures}
            ctaText="Upgrade to Pro"
            ctaLink="/signup"
            popular={true}
            isYearly={isYearly}
          />
        </div>
        
        {/* Money-back guarantee */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-muted-foreground text-sm">
            All plans come with a 14-day money-back guarantee. No questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
