import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <main className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.05)_25%,rgba(0,0,0,0.05)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.05)_75%)] bg-[length:20px_20px] opacity-30"></div>
      
      <div className="container mx-auto px-4 py-16 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Say Goodbye to<br />Task Overload
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Prioritize, automate, and stay ahead—AI simplifies your tasks so you can focus on what matters most.
        </p>
        <Button size="lg" className="font-medium">
          Get started
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div>
    </main>
  );
}
