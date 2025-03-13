"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { motion } from "framer-motion";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  shape: "square" | "circle" | "triangle" | "hexagon" | "star" | "dot";
  color: "primary" | "secondary" | "accent" | "muted";
  animationDuration: number;
  delay: number;
}

export function FloatingElements() {
  const { resolvedTheme } = useTheme();
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate random floating elements
    const newElements: FloatingElement[] = [];
    const shapes: ("square" | "circle" | "triangle" | "hexagon" | "star" | "dot")[] = 
      ["square", "circle", "triangle", "hexagon", "star", "dot"];
    const colors: ("primary" | "secondary" | "accent" | "muted")[] = 
      ["primary", "secondary", "accent", "muted"];
    
    for (let i = 0; i < 25; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 10,
        opacity: Math.random() * 0.12 + 0.05,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        animationDuration: Math.random() * 25 + 15,
        delay: Math.random() * 5
      });
    }
    
    setElements(newElements);
  }, []);

  const getShapeStyles = (color: string) => {
    const isDark = resolvedTheme === "dark";
    
    switch(color) {
      case "primary":
        return isDark ? "border-primary/30 bg-primary/5" : "border-primary/20 bg-primary/5";
      case "secondary":
        return isDark ? "border-secondary/30 bg-secondary/5" : "border-secondary/20 bg-secondary/5";
      case "accent":
        return isDark ? "border-accent/30 bg-accent/5" : "border-accent/20 bg-accent/5";
      case "muted":
      default:
        return isDark ? "border-muted/30 bg-muted/5" : "border-muted/20 bg-muted/5";
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          initial={{ 
            x: `${element.x}%`, 
            y: `${element.y}%`, 
            opacity: 0,
            rotate: element.rotation,
            scale: 0.5
          }}
          animate={{ 
            opacity: element.opacity,
            scale: 1
          }}
          transition={{
            duration: 1.5,
            delay: element.delay,
            ease: "easeOut"
          }}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            zIndex: 0
          }}
        >
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: element.animationDuration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          >
            {element.shape === "square" && (
              <div 
                className={`border ${getShapeStyles(element.color)} backdrop-blur-sm`}
                style={{ width: element.size, height: element.size }}
              />
            )}
            {element.shape === "circle" && (
              <div 
                className={`rounded-full border ${getShapeStyles(element.color)} backdrop-blur-sm`}
                style={{ width: element.size, height: element.size }}
              />
            )}
            {element.shape === "triangle" && (
              <div 
                className={`w-0 h-0 border-l border-r border-b ${getShapeStyles(element.color)}`}
                style={{ 
                  borderLeftWidth: element.size / 2, 
                  borderRightWidth: element.size / 2, 
                  borderBottomWidth: element.size 
                }}
              />
            )}
            {element.shape === "hexagon" && (
              <div className="relative">
                <div 
                  className={`hexagon border ${getShapeStyles(element.color)} backdrop-blur-sm`}
                  style={{ 
                    width: element.size, 
                    height: element.size * 0.866 // height = width * sin(60°)
                  }}
                />
              </div>
            )}
            {element.shape === "star" && (
              <div 
                className={`star-shape ${getShapeStyles(element.color)}`}
                style={{ 
                  width: element.size, 
                  height: element.size
                }}
              />
            )}
            {element.shape === "dot" && (
              <div 
                className={`rounded-full ${getShapeStyles(element.color)}`}
                style={{ 
                  width: element.size / 3, 
                  height: element.size / 3
                }}
              />
            )}
          </motion.div>
        </motion.div>
      ))}

      <style jsx global>{`
        .hexagon {
          position: relative;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
        
        .star-shape {
          clip-path: polygon(
            50% 0%, 61% 35%, 98% 35%, 68% 57%,
            79% 91%, 50% 70%, 21% 91%, 32% 57%,
            2% 35%, 39% 35%
          );
        }
      `}</style>
    </div>
  );
}
