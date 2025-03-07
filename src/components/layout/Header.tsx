import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="container mx-auto py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <div className="mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5L9 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 12L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M3 19L18 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <Link href="/" className="text-xl font-bold">OxiNews</Link>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8">
        <div className="relative group">
          <button className="flex items-center space-x-1">
            <span>Features</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <Link href="/about" className="hover:text-primary">About us</Link>
        <Link href="/pricing" className="hover:text-primary">Pricing</Link>
        <Link href="/faq" className="hover:text-primary">FAQ</Link>
        <Link href="/contact" className="hover:text-primary">Contact</Link>
      </nav>

      {/* Right Side - Theme Toggle and Auth Buttons */}
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Link href="/login">
          <Button variant="outline" className="font-medium">
            Login
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </Link>
        <Link href="/signup">
          <Button className="font-medium">
            Sign up
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </Link>
      </div>
    </header>
  );
}
