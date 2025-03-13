"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Zap,
  Sparkles,
  UserCheck
} from "lucide-react";

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function BenefitCard({ 
  icon, 
  title, 
  description, 
  index
}: BenefitCardProps) {
  // Alternate card styles based on index
  const isEven = index % 2 === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`border border-primary/10 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full ${isEven ? 'bg-gradient-to-br from-background to-primary/5' : 'bg-gradient-to-br from-background to-secondary/5'}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 p-3 rounded-xl ${isEven ? 'bg-primary/10' : 'bg-secondary/10'} relative overflow-hidden`}>
              {/* Animated gradient background */}
              <div className={`absolute inset-0 ${isEven ? 'bg-gradient-to-br from-primary/20 to-transparent' : 'bg-gradient-to-br from-secondary/20 to-transparent'} opacity-50`}></div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 3, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
                className="relative z-10 text-primary"
              >
                {icon}
              </motion.div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
              <p className="text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function BenefitsSection() {
  const benefits = [
    {
      icon: <BarChart3 size={24} />,
      title: "Marketing Pros",
      description: "Gain early insights on emerging trends and consumer sentiment to inform campaigns."
    },
    {
      icon: <Users size={24} />,
      title: "Community Managers",
      description: "Keep your finger on the pulse, quickly addressing community concerns and engaging proactively."
    },
    {
      icon: <FileText size={24} />,
      title: "Analysts & Researchers",
      description: "Efficiently distill vast amounts of data into actionable intelligence for reports and strategies."
    },
    {
      icon: <Zap size={24} />,
      title: "Innovative Entrepreneurs",
      description: "Stay ahead of industry shifts and outsmart competitors by leveraging timely insights."
    }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/5 to-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--primary)/5_1px,transparent_1px),linear-gradient(180deg,var(--primary)/5_1px,transparent_1px)] bg-[size:70px_70px] opacity-20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Badge variant="outline" className="mb-4 py-1.5 px-4 text-sm font-medium border-primary/20 bg-primary/5">
            <UserCheck size={14} className="mr-1 text-primary" />
            <span>Perfect For You</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Benefits</span> from OxiNews?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tailored insights for professionals across various fields
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard 
              key={index}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              index={index}
            />
          ))}
        </div>
        
        {/* Additional Highlight */}
        <motion.div 
          className="mt-16 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Sparkles size={28} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Information Experience?</h3>
          <p className="text-muted-foreground">
            Join thousands of professionals who have already revolutionized how they gather insights and make decisions.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
