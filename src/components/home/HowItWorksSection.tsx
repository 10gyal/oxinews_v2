"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListFilter, Clock, Mail, ArrowRight } from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

function Step({ number, title, description, icon, delay }: StepProps) {
  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Step Card */}
      <Card className="flex flex-col items-center text-center p-6 border-primary/10 bg-background/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 relative z-10 h-full">
        <div className="relative mb-8">
          {/* Icon Circle with Glow */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-full blur-sm opacity-75"></div>
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: delay * 0.5
                }}
              >
                {icon}
              </motion.div>
            </div>
          </div>
          
          {/* Number Badge */}
          <motion.div 
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: delay + 0.3
            }}
          >
            {number}
          </motion.div>
        </div>
        
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground text-base">{description}</p>
      </Card>
      
      {/* Connector Arrow (only for steps 1 and 2) */}
      {number < 3 && (
        <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + 0.5 }}
          >
            <ArrowRight size={24} className="text-primary/40" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export function HowItWorksSection() {
  const { resolvedTheme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [50, 0, 0, 50]);
  
  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-secondary/5 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--primary)/5%_0%,transparent_70%)] opacity-70"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-secondary/10 to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)/5_1px,transparent_1px),linear-gradient(180deg,var(--primary)/5_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
            <Clock size={14} className="mr-1 text-primary" />
            <span>Simple Process</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">OxiNews</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your information experience
          </p>
        </motion.div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto relative">
          {/* Step 1 */}
          <Step 
            number={1}
            title="Create a Pipeline"
            description="Set your focus keywords, choose frequency, and create a tailored pipeline in just minutes."
            icon={<ListFilter size={28} />}
            delay={0.1}
          />
          
          {/* Step 2 */}
          <Step 
            number={2}
            title="Define Your Sources"
            description="Easily select your platforms and targeted communities, starting with Reddit."
            icon={<Clock size={28} />}
            delay={0.3}
          />
          
          {/* Step 3 */}
          <Step 
            number={3}
            title="Enjoy Curated Insights"
            description="Receive concise, insightful summaries right in your inbox, helping you make informed decisions faster."
            icon={<Mail size={28} />}
            delay={0.5}
          />
          
          {/* Animated Connection Line */}
          <div className="hidden md:block absolute top-[100px] left-[16%] right-[16%] h-0.5 z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.8 }}
              style={{ transformOrigin: "left" }}
            ></motion.div>
          </div>
        </div>
        
        {/* Pipeline Images */}
        <motion.div 
          className="mt-24 max-w-5xl mx-auto"
          style={{ opacity, y }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* First Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary/50 via-secondary/30 to-accent/20 opacity-70 -z-10"></div>
                
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl blur-xl opacity-50"></div>
                
                <div className="relative rounded-2xl overflow-hidden bg-card">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={resolvedTheme === "dark" ? "/product_screenshots/create_pipeline_dark.png" : "/product_screenshots/create_pipeline_light.png"}
                      alt="OxiNews Pipeline Creation Interface"
                      width={1000}
                      height={750}
                      className="w-full h-auto transition-opacity duration-300"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"></div>
                  </motion.div>
                  
                  {/* Caption */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                    <p className="text-sm font-medium">Step 1: Create your custom pipeline with specific keywords</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -left-6 w-12 h-12 border border-primary/20 rounded-lg rotate-12 bg-primary/5 backdrop-blur-sm hidden lg:block"></div>
            </motion.div>
            
            {/* Second Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-secondary/50 via-primary/30 to-accent/20 opacity-70 -z-10"></div>
                
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 via-primary/20 to-accent/20 rounded-2xl blur-xl opacity-50"></div>
                
                <div className="relative rounded-2xl overflow-hidden bg-card">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={resolvedTheme === "dark" ? "/product_screenshots/dashboard_dark.png" : "/product_screenshots/dashboard_light.png"}
                      alt="OxiNews Dashboard Interface"
                      width={1000}
                      height={750}
                      className="w-full h-auto transition-opacity duration-300"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent"></div>
                  </motion.div>
                  
                  {/* Caption */}
                  <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-primary/10">
                    <p className="text-sm font-medium">Step 3: View your personalized insights in a clean dashboard</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative Element */}
              <div className="absolute -top-6 -right-6 w-12 h-12 border border-secondary/20 rounded-full bg-secondary/5 backdrop-blur-sm hidden lg:block"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
