"use client";

import Image from "next/image";
import { useTheme } from "@/components/providers/ThemeProvider";

interface ThemeLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({ width = 32, height = 32, className = "" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  
  // Simply use the resolvedTheme to determine which logo to show
  const logoSrc = resolvedTheme === "dark"
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
