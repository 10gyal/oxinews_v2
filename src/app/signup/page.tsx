import { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | OxiNews",
  description: "Create a new OxiNews account",
};

export default function SignupPage() {
  return (
    <main className="bg-background">
      <AuthCard
        title="Create an account"
        description="Enter your information to get started with OxiNews"
      >
        <SignupForm />
      </AuthCard>
    </main>
  );
}
