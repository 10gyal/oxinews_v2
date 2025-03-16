"use client";

import { AuthProvider as ModularAuthProvider, useAuth } from "./auth/AuthProvider";

// Re-export the AuthProvider and useAuth hook
export { useAuth };
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ModularAuthProvider>{children}</ModularAuthProvider>;
}
