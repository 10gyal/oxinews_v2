"use client";

export function IntroductionSection() {
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/5%_0%,transparent_70%)] opacity-70"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl md:text-2xl leading-relaxed text-foreground/90">
            OxiNews empowers you to transform chaotic social media conversations into concise, customized insights. 
            Instead of drowning in endless feeds, choose exactly what matters and effortlessly stay informed about 
            trends, competitors, or your brand&apos;s reputation.
          </p>
        </div>
      </div>
    </section>
  );
}
