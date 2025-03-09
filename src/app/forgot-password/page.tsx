import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="bg-background">
      <AuthCard
        title="Reset Password"
        description="Enter your email address and we'll send you a link to reset your password"
      >
        <Suspense fallback={<div className="p-4 text-center">Loading form...</div>}>
          <ForgotPasswordForm />
        </Suspense>
      </AuthCard>
    </main>
  );
} 