"use client";

import { AuthProvider as ModularAuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/authContext";

// Re-export the AuthProvider and useAuth hook
export { useAuth };
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <ModularAuthProvider>{children}</ModularAuthProvider>;
}
