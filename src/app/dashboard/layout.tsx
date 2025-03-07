"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Add a small delay before checking authentication state
    // This gives time for the auth state to be properly initialized
    const checkAuthAndRedirect = () => {
      // If not loading and no user is found, redirect to login
      if (!isLoading && !user) {
        router.push("/login");
      }
    };
    
    // Wait a moment before checking auth state
    const timer = setTimeout(checkAuthAndRedirect, 500);
    
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  // Show nothing while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
