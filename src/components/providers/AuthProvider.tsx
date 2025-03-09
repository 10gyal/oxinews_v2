"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Session, User, AuthError } from "@supabase/supabase-js";
import { signOut as supabaseSignOut, supabase, signInWithEmail, signUpWithEmail, signInWithOAuth } from "@/lib/supabase";

// Define auth state types
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  
  // Router
  const router = useRouter();
  const pathname = usePathname();

  // Navigation helpers
  const redirectToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Auth actions
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await signInWithEmail(email, password);
      
      // No need to update state or redirect here - the auth state listener will handle it
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: unknown }) => {
    try {
      const { error } = await signUpWithEmail(email, password, metadata);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await signInWithOAuth('google');
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
      redirectToLogin();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Initialize auth state and set up listener
  useEffect(() => {
    // Function to get the current session and user
    const initializeAuth = async () => {
      try {
        setStatus('loading');
        
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          // If we have a session, get the user
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          
          setSession(currentSession);
          setUser(currentUser);
          setStatus('authenticated');
          
          // If we're on the login page but already authenticated, redirect to dashboard
          if (pathname === '/login' || pathname === '/signup') {
            redirectToDashboard();
          }
        } else {
          setSession(null);
          setUser(null);
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setStatus('unauthenticated');
      }
    };
    
    // Initialize auth on mount
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Update session state
        setSession(newSession);
        
        if (newSession) {
          // Check if session is expired
          const expiresAt = new Date(newSession.expires_at! * 1000);
          if (expiresAt < new Date()) {
            // Session expired, sign out
            await handleSignOut();
            return;
          }

          // If we have a session, get and set the user
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setUser(currentUser);
          setStatus('authenticated');
          
          // Handle sign in event
          if (event === 'SIGNED_IN') {
            redirectToDashboard();
          }
        } else {
          // No session
          setUser(null);
          setStatus('unauthenticated');
          
          // Handle sign out event
          if (event === 'SIGNED_OUT' && 
              pathname !== '/login' && 
              pathname !== '/signup' && 
              !pathname.startsWith('/auth/')) {
            redirectToLogin();
          }
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, redirectToDashboard, redirectToLogin]);

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        // Auth state
        user,
        session,
        status,
        
        // Auth actions
        signIn,
        signUp,
        signInWithGoogle,
        signOut: handleSignOut,
        
        // Navigation helpers
        redirectToLogin,
        redirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
