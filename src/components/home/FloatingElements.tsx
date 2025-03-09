"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  shape: "square" | "circle" | "triangle";
  animationDuration: number;
}

export function FloatingElements() {
  const { theme } = useTheme();
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate random floating elements
    const newElements: FloatingElement[] = [];
    const shapes: ("square" | "circle" | "triangle")[] = ["square", "circle", "triangle"];
    
    for (let i = 0; i < 15; i++) {
      newElements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 30 + 10,
        opacity: Math.random() * 0.07 + 0.03,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        animationDuration: Math.random() * 20 + 20
      });
    }
    
    setElements(newElements);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute ${theme === "dark" ? "text-white" : "text-black"}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            opacity: element.opacity,
            transform: `rotate(${element.rotation}deg)`,
            animation: `float ${element.animationDuration}s infinite ease-in-out`,
            zIndex: 0
          }}
        >
          {element.shape === "square" && (
            <div 
              className={`border ${theme === "dark" ? "border-white/20" : "border-black/20"}`}
              style={{ width: element.size, height: element.size }}
            />
          )}
          {element.shape === "circle" && (
            <div 
              className={`rounded-full border ${theme === "dark" ? "border-white/20" : "border-black/20"}`}
              style={{ width: element.size, height: element.size }}
            />
          )}
          {element.shape === "triangle" && (
            <div 
              className={`w-0 h-0 border-l border-r border-b ${theme === "dark" ? "border-white/20" : "border-black/20"}`}
              style={{ 
                borderLeftWidth: element.size / 2, 
                borderRightWidth: element.size / 2, 
                borderBottomWidth: element.size 
              }}
            />
          )}
        </div>
      ))}

      <style jsx global>{`
        @-webkit-keyframes float {
          0%, 100% {
            -webkit-transform: translateY(0) rotate(0deg);
            transform: translateY(0) rotate(0deg);
          }
          50% {
            -webkit-transform: translateY(-20px) rotate(10deg);
            transform: translateY(-20px) rotate(10deg);
          }
        }
        @keyframes float {
          0%, 100% {
            -webkit-transform: translateY(0) rotate(0deg);
            transform: translateY(0) rotate(0deg);
          }
          50% {
            -webkit-transform: translateY(-20px) rotate(10deg);
            transform: translateY(-20px) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
