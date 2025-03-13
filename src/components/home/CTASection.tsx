"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced Background with 3D-like depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
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
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl"
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
      </div>
      
      {/* Enhanced Grid Pattern with Depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)/5_1px,transparent_1px),linear-gradient(180deg,var(--primary)/5_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--background)_0%,transparent_100%)] opacity-30"></div>
      </div>
      
      {/* Content Card with Glassmorphism */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Card Background with Gradient Border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-r from-primary/50 via-secondary/30 to-accent/20 opacity-70"></div>
          
          {/* Card Content */}
          <div className="bg-background/80 backdrop-blur-md rounded-2xl p-12 md:p-16 border border-primary/10 shadow-2xl">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <Badge variant="outline" className="py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
                  <Rocket size={14} className="mr-1 text-primary" />
                  <span>Get Started Today</span>
                </Badge>
              </motion.div>
              
              <motion.h2 
                className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Revolutionize</span> Your Information Strategy?
              </motion.h2>
              
              <motion.p 
                className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Start transforming social noise into actionable insights today and stay ahead of the curve.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="font-medium group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
                  >
                    <span className="relative z-10 flex items-center">
                      Create Your First Pipeline
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
                        <ArrowRight size={20} className="ml-2" />
                      </motion.div>
                    </span>
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </Button>
                </Link>
                
                {/* Decorative Sparkle Elements */}
                <motion.div 
                  className="absolute -top-10 -right-10 text-primary/60"
                  animate={{ 
                    rotate: [0, 15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Sparkles size={40} />
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-10 -left-10 text-secondary/60"
                  animate={{ 
                    rotate: [0, -15, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1
                  }}
                >
                  <Sparkles size={40} />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
