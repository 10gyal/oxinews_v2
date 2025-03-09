import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="bg-background">
      <AuthCard
        title="Reset Password"
        description="Enter your new password below"
      >
        <Suspense fallback={<div className="p-4 text-center">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </main>
  );
} 