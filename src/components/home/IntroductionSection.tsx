"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";

export function IntroductionSection() {
  const { theme } = useTheme();

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/5%_0%,transparent_70%)] opacity-70"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transform Your Information Experience</h2>
            <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 mb-8">
              OxiNews empowers you to transform chaotic social media conversations into concise, customized insights. 
              Instead of drowning in endless feeds, choose exactly what matters and effortlessly stay informed about 
              trends, competitors, or your brand&apos;s reputation.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-foreground/80">Smart Summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-foreground/80">Custom Sources</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-foreground/80">Topic Tracking</span>
              </div>
            </div>
          </div>
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="relative rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm border border-border/50 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
              <Image
                src={theme === "dark" ? "/product_screenshots/dashboard_dark.png" : "/product_screenshots/dashboard_light.png"}
                alt="Dashboard Preview"
                width={1200}
                height={900}
                className="w-full h-auto transition-opacity duration-300"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
