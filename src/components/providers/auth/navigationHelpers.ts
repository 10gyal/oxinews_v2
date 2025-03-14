import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAuthNavigation() {
  const router = useRouter();

  // Navigation helpers
  const redirectToLogin = useCallback(() => {
    console.log("Redirecting to login page:", "/login");
    router.push("/login");
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return {
    redirectToLogin,
    redirectToDashboard
  };
}
