"use client";

import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex justify-between items-center w-full py-6 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">{question}</h3>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}
      >
        <p className="text-muted-foreground">{answer}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const faqs: FAQItemProps[] = [
    {
      question: "What is a pipeline?",
      answer: "A pipeline is your personalized summary engine. It's a custom setup where you select specific social media sources, choose the topics or keywords you care about, and set how frequently you'd like to receive updates. Each pipeline delivers targeted summaries straight to your inbox."
    },
    {
      question: "How should I write the focus topic?",
      answer: "Your focus topic should clearly indicate the specific information or insights you're interested in. This helps us efficiently cut through the noise and deliver exactly what you care about."
    },
    {
      question: "Can I put different focus topics under one pipeline?",
      answer: "Technically, yes, you can. However, mixing vastly different topics in one pipeline may result in less focused insights. For best results, keep each pipeline dedicated to closely related topics."
    },
    {
      question: "Why is this different than using ChatGPT, Claude, Gemini, or other LLMs?",
      answer: "OxiNews provides content grounded with citations, formatted specifically for easy readability, and scheduled directly to your inbox. It ensures highly focused information retrieval tailored precisely to your perspective and sentiment analysis needs."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about OxiNews
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
