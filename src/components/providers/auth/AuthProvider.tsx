"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "./authContext";
import { AuthStatus } from "./types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Router
  const router = useRouter();
  const pathname = usePathname();

  // Simple navigation helpers
  const redirectToLogin = useCallback(() => {
    if (pathname !== '/login') router.push('/login');
  }, [pathname, router]);
  
  const redirectToDashboard = useCallback(() => {
    if (pathname !== '/dashboard') router.push('/dashboard');
  }, [pathname, router]);
  
  // Check if a session is expired
  const isSessionExpired = useCallback((session: Session | null): boolean => {
    if (!session || !session.expires_at) return true;
    const expiresAt = new Date(session.expires_at * 1000);
    return expiresAt < new Date();
  }, []);

  // Auth actions with loading state management
  const signIn = useCallback(async (email: string, password: string) => {
    if (isAuthenticating) return { error: new Error('Authentication already in progress') };
    
    try {
      setIsAuthenticating(true);
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);
  
  const signUp = useCallback(async (email: string, password: string, metadata?: { [key: string]: unknown }) => {
    if (isAuthenticating) return { error: new Error('Authentication already in progress') };
    
    try {
      setIsAuthenticating(true);
      return await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);
  
  const signInWithGoogle = useCallback(async () => {
    if (isAuthenticating) return { error: new Error('Authentication already in progress') };
    
    try {
      setIsAuthenticating(true);
      return await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          queryParams: { prompt: 'select_account' }
        }
      });
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);
  
  const signOut = useCallback(async () => {
    if (isAuthenticating) return;
    
    try {
      setIsAuthenticating(true);
      await supabase.auth.signOut();
      
      // Clear state to prevent stale data
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
      
      // Redirect
      redirectToLogin();
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect even with error
      redirectToLogin();
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, redirectToLogin]);

  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;
    
    // Initial auth setup
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession || isSessionExpired(currentSession)) {
          if (mounted) {
            setSession(null);
            setUser(null);
            setStatus('unauthenticated');
          }
          return;
        }
        
        // Get user data
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentUser);
          setStatus('authenticated');
          
          // Handle redirects
          if (pathname === '/login' || pathname === '/signup') {
            redirectToDashboard();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setStatus('unauthenticated');
        }
      }
    };
    
    // Run initialization
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        
        console.log(`Auth state change: ${event}`);
        
        try {
          // Handle sign out
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
            setStatus('unauthenticated');
            
            // Redirect if needed
            if (pathname !== '/login' && pathname !== '/signup' && !pathname.startsWith('/auth/')) {
              redirectToLogin();
            }
            return;
          }
          
          // For other events, update the session
          if (newSession) {
            if (isSessionExpired(newSession)) {
              // Handle expired session
              await supabase.auth.signOut();
              setStatus('unauthenticated');
              redirectToLogin();
              return;
            }
            
            // Get user data and update state
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            
            setSession(newSession);
            setUser(currentUser);
            setStatus('authenticated');
            
            // Handle sign in event
            if (event === 'SIGNED_IN') {
              redirectToDashboard();
            }
          } else {
            // No session
            setUser(null);
            setSession(null);
            setStatus('unauthenticated');
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          // Reset to safe state
          setUser(null);
          setSession(null);
          setStatus('unauthenticated');
        }
      }
    );
    
    // Clean up
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, redirectToDashboard, redirectToLogin, isSessionExpired]);

  // Create a stable auth context value
  const authContextValue = useMemo(() => ({
    // Auth state
    user,
    session,
    status,
    isAuthenticating,
    
    // Auth actions
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    
    // Navigation helpers
    redirectToLogin,
    redirectToDashboard,
  }), [
    user, 
    session, 
    status, 
    isAuthenticating,
    redirectToDashboard,
    redirectToLogin,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  ]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
