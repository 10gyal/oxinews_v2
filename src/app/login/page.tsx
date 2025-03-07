import { Metadata } from "next";
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
      <VerificationAlert />
      <AuthCard
        title="Welcome back"
        description="Enter your credentials to access your account"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
