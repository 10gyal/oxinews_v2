"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { FloatingElements } from "./FloatingElements";

export function HeroSection() {
  const { theme } = useTheme();
  
  // Apply different styles based on theme
  const circleColorPrimary = theme === "dark" ? "bg-primary/20" : "bg-primary/10";
  const circleColorSecondary = theme === "dark" ? "bg-secondary/20" : "bg-secondary/10";

  return (
    <main className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      
      {/* Animated Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${circleColorPrimary} rounded-full blur-3xl animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${circleColorSecondary} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_1px,transparent_1px),linear-gradient(180deg,var(--background)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]"></div>
      
      {/* Floating Elements */}
      <FloatingElements />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center z-10 relative">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Turn Social Noise into <br/>Actionable Insights
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Get personalized, focused summaries of online discussions from Reddit, X, Telegram, Discord, and beyond—directly in your inbox.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="font-medium">
              Get Started For Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </Link>
          <Link href="/popular">
            <Button size="lg" variant="outline" className="font-medium">
              See Popular Use Cases
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
