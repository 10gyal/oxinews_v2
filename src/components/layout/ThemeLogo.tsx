"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({ width = 32, height = 32, className = "" }: ThemeLogoProps) {
  const { theme } = useTheme();
  
  // Handle system theme by checking if we're in the browser
  const isDarkTheme = () => {
    if (theme === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false; // Default to light theme on server
    }
    return theme === "dark";
  };
  
  const logoSrc = isDarkTheme()
    ? "/oxinews_logo_dark.svg" 
    : "/oxinews_logo_light.svg";
  
  return (
    <Image 
      src={logoSrc} 
      alt="OxiNews Logo" 
      width={width}
      height={height}
      className={className}
    />
  );
}
