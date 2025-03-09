"use client";

import Image from "next/image";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function Step({ number, title, description, icon }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How OxiNews Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your information experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <Step 
            number={1}
            title="Create a Pipeline"
            description="Set your focus keywords, choose frequency, and create a tailored pipeline in just minutes."
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6H20M9 12H20M9 18H20M5 6V6.01M5 12V12.01M5 18V18.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          
          <Step 
            number={2}
            title="Define Your Sources"
            description="Easily select your platforms and targeted communities, starting with Reddit."
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
          
          <Step 
            number={3}
            title="Enjoy Curated Insights"
            description="Receive concise, insightful summaries right in your inbox, helping you make informed decisions faster."
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L10.8906 13.2604C11.5624 13.7083 12.4376 13.7083 13.1094 13.2604L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>
        
        {/* Pipeline Images */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-2xl blur-xl"></div>
            <div className="relative">
              <Image
                src="/product_screenshots/create_pipeline_dark.png"
                alt="Pipeline creation interface"
                width={1200}
                height={675}
                className="hidden dark:block w-full rounded-xl shadow-2xl"
              />
              <Image
                src="/product_screenshots/create_pipeline_light.png"
                alt="Pipeline creation interface"
                width={1200}
                height={675}
                className="block dark:hidden w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
        
        {/* Connector Lines (visible on md screens and up) */}
        <div className="hidden md:block relative max-w-5xl mx-auto">
          <div className="absolute top-[88px] left-[calc(16.67%+8px)] right-[calc(16.67%+8px)] h-0.5 bg-primary/20"></div>
        </div>
      </div>
    </section>
  );
}
