import { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { VerificationAlert } from "@/components/auth/VerificationAlert";

export const metadata: Metadata = {
  title: "Login | OxiNews",
  description: "Sign in to your OxiNews account",
};

export default function LoginPage() {
  return (
    <main className="bg-background">
      <Suspense fallback={<div className="max-w-md mx-auto pt-6 px-4"></div>}>
        <VerificationAlert />
      </Suspense>
      <AuthCard
        title="Welcome back"
        description="Enter your credentials to access your account"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
