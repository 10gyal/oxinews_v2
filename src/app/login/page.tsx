import { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Login | OxiNews",
  description: "Sign in to your OxiNews account",
};

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ searchParams = {} }: LoginPageProps) {
  const message = searchParams?.message as string | undefined;
  return (
    <main className="bg-background">
      {message === "check-email" && (
        <div className="max-w-md mx-auto pt-6 px-4">
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/50">
            <CheckCircle2 className="text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-400">Email verification required</AlertTitle>
            <AlertDescription className="text-green-700/90 dark:text-green-400/90">
              We&apos;ve sent a verification link to your email. Please check your inbox and verify your account before logging in.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <AuthCard
        title="Welcome back"
        description="Enter your credentials to access your account"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
