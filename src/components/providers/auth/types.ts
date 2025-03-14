import { Session, User, AuthError } from "@supabase/supabase-js";

// Define auth state types
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthContextType = {
  // Auth state
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, metadata?: { [key: string]: unknown }) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  
  // Navigation helpers
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
};
