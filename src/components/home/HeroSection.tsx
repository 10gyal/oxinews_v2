"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/ThemeProvider";
import { FloatingElements } from "./FloatingElements";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mail, MessageSquare } from "lucide-react";

export function HeroSection() {
  const { resolvedTheme } = useTheme();
  
  // Apply different styles based on theme
  const isDark = resolvedTheme === "dark";
  const circleColorPrimary = isDark ? "bg-primary/20" : "bg-primary/10";
  const circleColorSecondary = isDark ? "bg-secondary/20" : "bg-secondary/10";
  const accentColorGradient = isDark 
    ? "from-primary/20 via-secondary/20 to-accent/20" 
    : "from-primary/10 via-secondary/10 to-accent/10";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center relative overflow-hidden min-h-[90vh]">
      {/* Enhanced Background with 3D-like depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className={`absolute -top-40 -right-40 w-[500px] h-[500px] ${circleColorPrimary} rounded-full blur-3xl`}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        ></motion.div>
        <motion.div 
          className={`absolute -bottom-40 -left-40 w-[500px] h-[500px] ${circleColorSecondary} rounded-full blur-3xl`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        ></motion.div>
        <motion.div 
          className={`absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl`}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        ></motion.div>
      </div>
      
      {/* Enhanced Grid Pattern with Depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_1px,transparent_1px),linear-gradient(180deg,var(--background)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.07]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--background)_0%,transparent_100%)] opacity-30"></div>
      </div>
      
      {/* Floating Elements */}
      <FloatingElements />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 z-10 relative">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
                <Sparkles size={14} className="mr-1 text-primary" />
                <span>AI-Powered Social Insights</span>
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
              variants={itemVariants}
            >
              Turn Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary">Noise</span> into <span className="relative">
                Actionable
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></span>
              </span> Insights
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8"
              variants={itemVariants}
            >
              Get personalized, focused summaries of online discussions from Reddit, X, Telegram, Discord, and beyond—directly in your inbox.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              variants={itemVariants}
            >
              <Link href="/signup">
                <Button size="lg" className="font-medium group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 px-6">
                  <span className="relative z-10 flex items-center">
                    Get Started For Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                        times: [0, 0.6, 1]
                      }}
                    >
                      <ArrowRight size={18} className="ml-2" />
                    </motion.div>
                  </span>
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
              </Link>
              <Link href="/popular">
                <Button size="lg" variant="outline" className="font-medium border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                  See Popular Use Cases
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <Mail size={16} className="mr-2 text-primary" />
                <span>Email Delivery</span>
              </div>
              <div className="flex items-center">
                <MessageSquare size={16} className="mr-2 text-primary" />
                <span>Multiple Sources</span>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column - Device Mockup */}
          <motion.div 
            className="hidden lg:block relative"
            variants={itemVariants}
          >
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-10 -left-10 w-20 h-20 border border-primary/20 rounded-lg rotate-12 bg-primary/5 backdrop-blur-sm"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 border border-secondary/20 rounded-full bg-secondary/5 backdrop-blur-sm"></div>
              
              {/* Device Frame */}
              <div className="relative mx-auto max-w-md">
                <motion.div
                  className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl bg-card backdrop-blur-sm"
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary/50 via-secondary/30 to-accent/20 opacity-70 -z-10"></div>
                  
                  {/* Screenshot */}
                  <div className="relative">
                    <Image
                      src={resolvedTheme === "dark" ? "/product_screenshots/dashboard_dark.png" : "/product_screenshots/dashboard_light.png"}
                      alt="OxiNews Dashboard"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-30"></div>
                    
                    {/* Glowing Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${accentColorGradient} opacity-30 mix-blend-overlay`}></div>
                  </div>
                </motion.div>
                
                {/* Floating Notification */}
                <motion.div
                  className="absolute -right-12 top-1/4 bg-card border border-border rounded-lg shadow-lg p-3 w-64"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  whileHover={{ y: -3, boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">New Insights Ready</h4>
                      <p className="text-xs text-muted-foreground">Your daily summary from r/MachineLearning is ready to view.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
