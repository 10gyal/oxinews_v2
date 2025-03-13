"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  FileText, 
  Globe, 
  ListFilter, 
  Calendar, 
  Sparkles,
  MessageSquare,
  Zap,
  Shield,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  category: string;
}

function FeatureCard({ icon, title, description, index, category }: FeatureCardProps) {
  // Gradient colors based on index
  const gradients = [
    "from-primary/20 to-secondary/20",
    "from-secondary/20 to-accent/20",
    "from-accent/20 to-primary/20",
    "from-primary/20 to-accent/20",
    "from-secondary/20 to-primary/20"
  ];
  
  const gradient = gradients[index % gradients.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="border border-primary/10 shadow-sm hover:shadow-xl transition-all duration-300 h-full overflow-hidden group relative">
        {/* Subtle gradient background that shows on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="text-xs font-normal bg-background/80 backdrop-blur-sm">
            {category}
          </Badge>
        </div>
        
        <CardHeader className="pb-2 relative">
          <motion.div 
            className={`mb-4 p-3 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {/* Animated background for icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              {icon}
            </motion.div>
          </motion.div>
          
          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
            {description}
          </p>
        </CardContent>
        
        {/* Decorative corner accent */}
        <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden">
          <div className={`absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl ${gradient} opacity-20 transform rotate-45 translate-x-8 translate-y-8`}></div>
        </div>
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  // Define feature categories
  const categories = {
    content: "Content Processing",
    customization: "Customization",
    delivery: "Delivery",
    analytics: "Analytics"
  };
  
  // Define features with categories
  const features = [
    {
      icon: <FileText size={24} />,
      title: "Precision Summaries",
      description: "OxiNews intelligently extracts meaningful insights from extensive discussions, highlighting exactly what's relevant to you.",
      category: categories.content
    },
    {
      icon: <Globe size={24} />,
      title: "Fully Customizable Sources",
      description: "Start with Reddit and soon expand your reach to X, Telegram, Discord, and other key platforms.",
      category: categories.customization
    },
    {
      icon: <ListFilter size={24} />,
      title: "Topic-Specific Pipelines",
      description: "Zero in on keywords and themes critical to your goals—no distractions, just valuable information.",
      category: categories.customization
    },
    {
      icon: <Calendar size={24} />,
      title: "Flexible Scheduling & Delivery",
      description: "Receive tailored summaries directly to your inbox on your preferred schedule—daily, weekly, or monthly.",
      category: categories.delivery
    },
    {
      icon: <Sparkles size={24} />,
      title: "AI-Powered Analysis",
      description: "Leverage advanced AI to identify patterns, trends, and sentiment across conversations.",
      category: categories.analytics
    },
    {
      icon: <MessageSquare size={24} />,
      title: "Multi-Platform Integration",
      description: "Connect to all your favorite social platforms with a unified experience and consistent insights.",
      category: categories.customization
    },
    {
      icon: <Zap size={24} />,
      title: "Real-time Alerts",
      description: "Get notified immediately when critical topics or keywords are trending in your monitored communities.",
      category: categories.delivery
    },
    {
      icon: <Shield size={24} />,
      title: "Privacy-Focused Design",
      description: "Your data stays private and secure with our robust privacy controls and transparent data practices.",
      category: categories.content
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Sentiment Tracking",
      description: "Understand the emotional context behind discussions with detailed sentiment analysis.",
      category: categories.analytics
    },
    {
      icon: <RefreshCw size={24} />,
      title: "Continuous Improvement",
      description: "Our system learns from your feedback to deliver increasingly relevant insights over time.",
      category: categories.content
    }
  ];
  
  // Get unique categories
  const uniqueCategories = [...new Set(features.map(feature => feature.category))];
  
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--secondary)/5_1px,transparent_1px),linear-gradient(180deg,var(--secondary)/5_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
            <Sparkles size={14} className="mr-1 text-primary" />
            <span>Powerful Capabilities</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to transform your information experience
          </p>
        </motion.div>
        
        {/* Tabbed Features */}
        <Tabs defaultValue="all" className="w-full max-w-5xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-secondary/10 p-1">
              <TabsTrigger value="all" className="text-sm">All Features</TabsTrigger>
              {uniqueCategories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-sm">{category}</TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                  category={feature.category}
                />
              ))}
            </div>
          </TabsContent>
          
          {uniqueCategories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features
                  .filter(feature => feature.category === category)
                  .map((feature, index) => (
                    <FeatureCard 
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      index={index}
                      category={feature.category}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
