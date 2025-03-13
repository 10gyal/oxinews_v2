"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useOnboarding } from "@/components/providers/OnboardingProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();
  const { isOnboarding } = useOnboarding();
  const router = useRouter();

  // Redirect if not authenticated or not in onboarding
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && !isOnboarding) {
      router.push('/dashboard');
    }
  }, [status, isOnboarding, router]);

  // Show loading state while checking auth
  if (status === 'loading' || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1">
        <div className="container max-w-screen-md mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
