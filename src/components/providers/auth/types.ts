import { Session, User, AuthError } from "@supabase/supabase-js";

// This file is kept for backward compatibility
// The actual types are now defined directly in AuthProvider.tsx
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Re-export the AuthContextType for backward compatibility
export type AuthContextType = {
  // Auth state
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  isAuthenticating: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, metadata?: { [key: string]: unknown }) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  
  // Navigation helpers
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
};
