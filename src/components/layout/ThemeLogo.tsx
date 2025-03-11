"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({ width = 40, height = 40, className = "" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  
  // Use theme-specific logo
  const logoSrc = resolvedTheme === "dark"
    ? "/oxinews_logo_dark.svg" 
    : "/oxinews_logo.svg";
  
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
