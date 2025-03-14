"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ThemeLogo } from "@/components/layout/ThemeLogo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      // Use the centralized signOut function from AuthProvider
      // This handles all state updates, localStorage cleanup, and navigation
      await signOut();
    } catch (err) {
      console.error("Logout exception:", err);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Content",
      href: "/dashboard/content",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Account",
      href: "/dashboard/account",
      icon: <User className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="shadow-sm"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-16 transform border-r bg-card/80 backdrop-blur-sm transition-transform duration-200 ease-in-out md:relative md:translate-x-0 shadow-sm",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <TooltipProvider>
          <div className="flex h-full flex-col items-center">
            {/* Logo */}
            <div className="flex items-center justify-center border-b w-full py-5">
              <Link href="/dashboard" className="flex items-center justify-center">
                <ThemeLogo width={32} height={32} />
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 w-full flex flex-col items-center py-8 space-y-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {item.icon}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Bottom section */}
            <div className="border-t w-full py-5 flex flex-col items-center space-y-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent transition-colors duration-200">
                    <ThemeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-11 w-11 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden border rounded-xl m-4 shadow-sm bg-card/30 backdrop-blur-[2px]">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
