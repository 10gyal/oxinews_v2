"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  Search, 
  HelpCircle,
  MessageSquare,
  Settings,
  Mail
} from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  category: string;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  searchTerm: string;
}

function FAQItem({ question, answer, category, index, isOpen, onToggle, searchTerm }: FAQItemProps) {
  // Highlight search term in question and answer
  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? <span key={i} className="bg-primary/20 text-primary font-medium rounded px-1">{part}</span> 
        : part
    );
  };

  return (
    <motion.div 
      className="border border-primary/10 rounded-lg mb-4 overflow-hidden bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <button
        className="flex justify-between items-center w-full p-6 text-left"
        onClick={onToggle}
      >
        <div className="flex items-start gap-4 pr-8">
          <div className="flex-shrink-0 mt-1">
            {category === "General" && <HelpCircle size={20} className="text-primary" />}
            {category === "Technical" && <Settings size={20} className="text-primary" />}
            {category === "Usage" && <MessageSquare size={20} className="text-primary" />}
            {category === "Delivery" && <Mail size={20} className="text-primary" />}
          </div>
          <div>
            <h3 className="text-lg font-medium">{highlightText(question)}</h3>
            <div className="mt-1">
              <Badge variant="outline" className="text-xs font-normal bg-primary/5 border-primary/10">
                {category}
              </Badge>
            </div>
          </div>
        </div>
        <motion.div 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 text-primary"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-0 border-t border-primary/10">
              <p className="text-muted-foreground leading-relaxed">
                {highlightText(answer)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqs = [
    {
      question: "What is a pipeline?",
      answer: "A pipeline is your personalized summary engine. It's a custom setup where you select specific social media sources, choose the topics or keywords you care about, and set how frequently you'd like to receive updates. Each pipeline delivers targeted summaries straight to your inbox.",
      category: "General"
    },
    {
      question: "How should I write the focus topic?",
      answer: "Your focus topic should clearly indicate the specific information or insights you're interested in. This helps us efficiently cut through the noise and deliver exactly what you care about. For best results, use specific keywords rather than broad topics.",
      category: "Usage"
    },
    {
      question: "Can I put different focus topics under one pipeline?",
      answer: "Technically, yes, you can. However, mixing vastly different topics in one pipeline may result in less focused insights. For best results, keep each pipeline dedicated to closely related topics. This ensures your summaries remain relevant and actionable.",
      category: "Usage"
    },
    {
      question: "Why is this different than using ChatGPT, Claude, Gemini, or other LLMs?",
      answer: "OxiNews provides content grounded with citations, formatted specifically for easy readability, and scheduled directly to your inbox. It ensures highly focused information retrieval tailored precisely to your perspective and sentiment analysis needs. Unlike general LLMs, OxiNews is specifically designed for social media monitoring and analysis.",
      category: "Technical"
    },
    {
      question: "How often will I receive summaries?",
      answer: "You have complete control over the delivery schedule. You can choose to receive summaries daily, weekly, or monthly, depending on your needs and preferences. You can also adjust this schedule at any time from your dashboard.",
      category: "Delivery"
    }
  ];
  
  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-background to-secondary/5 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      
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
            <HelpCircle size={14} className="mr-1 text-primary" />
            <span>Got Questions?</span>
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to know about OxiNews
          </p>
          
          {/* Search Input */}
          <div className="max-w-md mx-auto relative mb-12">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search questions..."
              className="pl-10 py-6 bg-background/80 backdrop-blur-sm border-primary/10 focus:border-primary/30 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <FAQItem 
                key={index} 
                question={faq.question} 
                answer={faq.answer}
                category={faq.category}
                index={index}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                searchTerm={searchTerm}
              />
            ))
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-muted-foreground">No questions found matching &ldquo;{searchTerm}&rdquo;</p>
              <button 
                className="mt-4 text-primary hover:underline"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            </motion.div>
          )}
        </div>
        
        {/* Additional Help */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-muted-foreground">
            Still have questions? Ask us any question via the customer service chat bot on the bottom right corner of the screen.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
