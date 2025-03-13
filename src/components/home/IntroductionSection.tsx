"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Filter, Zap, TrendingUp, RefreshCw, BarChart3 } from "lucide-react";

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureHighlight({ icon, title, description, delay }: FeatureHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-primary/10 bg-background/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 h-full">
        <CardContent className="pt-6">
          <div className="mb-4 p-3 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function IntroductionSection() {
  const { resolvedTheme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);
  
  return (
    <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/10%_0%,transparent_70%)]"
        style={{ opacity }}
      ></motion.div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col gap-16">
          {/* Section Header */}
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
              <Zap size={14} className="mr-1 text-primary" />
              <span>Powerful Insights</span>
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Information Experience</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Cut through the noise and focus on what truly matters to you
            </p>
          </motion.div>
          
          {/* Video Showcase */}
          <motion.div 
            className="relative w-full max-w-[85%] mx-auto"
            style={{ scale }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl bg-background/50 backdrop-blur-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary/50 via-secondary/30 to-accent/20 opacity-70 -z-10"></div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-50"></div>
              
              <div className="relative rounded-2xl overflow-hidden">
                <video
                  src={resolvedTheme === "dark" ? "/videos/detailed_content_dark.webm" : "/videos/detailed_content_light.webm"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-auto transition-opacity duration-300"
                />
                
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"></div>
                
                {/* Play Button Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Caption */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg shadow-lg py-2 px-4 text-sm text-center">
              <span className="text-muted-foreground">See OxiNews in action</span>
            </div>
          </motion.div>
          
          {/* Description and Features */}
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl leading-relaxed text-foreground/90">
                OxiNews empowers you to transform chaotic social media conversations into concise, customized insights. 
                Instead of drowning in endless feeds, choose exactly what matters and effortlessly stay informed about 
                trends, competitors, or your brand&apos;s reputation.
              </p>
            </motion.div>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureHighlight 
                icon={<Brain size={24} />}
                title="AI-Powered Summaries"
                description="Advanced algorithms distill lengthy discussions into key insights you can act on immediately."
                delay={0.1}
              />
              <FeatureHighlight 
                icon={<Filter size={24} />}
                title="Custom Source Selection"
                description="Choose exactly which communities and platforms to monitor for the most relevant information."
                delay={0.2}
              />
              <FeatureHighlight 
                icon={<TrendingUp size={24} />}
                title="Trend Detection"
                description="Automatically identify emerging patterns and topics before they become mainstream."
                delay={0.3}
              />
              <FeatureHighlight 
                icon={<RefreshCw size={24} />}
                title="Flexible Scheduling"
                description="Set your preferred delivery cadence—daily, weekly, or monthly—to match your workflow."
                delay={0.4}
              />
              <FeatureHighlight 
                icon={<BarChart3 size={24} />}
                title="Sentiment Analysis"
                description="Understand the emotional context behind discussions with advanced sentiment tracking."
                delay={0.5}
              />
              <FeatureHighlight 
                icon={<Zap size={24} />}
                title="Time-Saving Efficiency"
                description="Reduce information overload and reclaim hours previously spent manually scanning feeds."
                delay={0.6}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
