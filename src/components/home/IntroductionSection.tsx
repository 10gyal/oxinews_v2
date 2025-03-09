"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { motion } from "framer-motion";

export function IntroductionSection() {
  const { theme } = useTheme();

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/5%_0%,transparent_70%)] opacity-70"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-12">
          <motion.div 
            className="relative w-full max-w-[90%] mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.7,
              ease: "easeOut"
            }}
          >
            <motion.div 
              className="relative rounded-xl overflow-hidden bg-background/50 backdrop-blur-sm before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-r before:from-primary/50 before:via-primary/30 before:to-transparent before:-z-10 after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-r after:from-primary/10 after:via-transparent after:to-transparent"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-transparent"></div>
              <video
                src={theme === "dark" ? "/videos/detailed_content_dark.webm" : "/videos/detailed_content_light.webm"}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-auto transition-opacity duration-300"
              />
            </motion.div>
          </motion.div>
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transform Your Information Experience</h2>
            <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 mb-8">
              OxiNews empowers you to transform chaotic social media conversations into concise, customized insights. 
              Instead of drowning in endless feeds, choose exactly what matters and effortlessly stay informed about 
              trends, competitors, or your brand&apos;s reputation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
