"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeLogo } from "./ThemeLogo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <ThemeLogo width={32} height={32} className="mr-2" />
          <span className="text-xl font-bold">OxiNews</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8">
        <Link href="/popular" className="hover:text-primary">Popular</Link>
        <Link href="/#pricing" className="hover:text-primary">Pricing</Link>
        <Link href="/#faq" className="hover:text-primary">FAQ</Link>
        <Link href="mailto:hello@oxinews.com" className="hover:text-primary">Contact</Link>
      </nav>

      {/* Right Side - Theme Toggle and Auth Buttons */}
      <div className="flex items-center">
        <ThemeToggle />
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4 ml-4">
          <Link href="/login">
            <Button variant="outline" className="font-medium">
              Login
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="font-medium">
              Sign up
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden ml-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center">
                <span className="text-lg font-bold"></span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col mt-6">
              <Link 
                href="/popular" 
                className="text-lg font-medium py-4 px-4 hover:text-primary border-b border-border/40"
                onClick={() => setIsOpen(false)}
              >
                Popular
              </Link>
              <Link 
                href="/#pricing" 
                className="text-lg font-medium py-4 px-4 hover:text-primary border-b border-border/40"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/#faq" 
                className="text-lg font-medium py-4 px-4 hover:text-primary border-b border-border/40"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                href="mailto:hello@oxinews.com" 
                className="text-lg font-medium py-4 px-4 hover:text-primary border-b border-border/40"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              <div className="mt-8 mb-4"></div>
              
              <div className="flex flex-col gap-3 px-4">
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                >
                  <Button variant="outline" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link 
                  href="/signup" 
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full justify-center">
                    Sign up
                  </Button>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
