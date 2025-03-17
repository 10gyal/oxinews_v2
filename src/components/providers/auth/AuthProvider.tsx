"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Define auth state types
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextType = {
  // Auth state
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  isAuthenticating: boolean;
  
  // Subscription state
  isPro: boolean;
  pipelineCount: number;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUp: (email: string, password: string, metadata?: { [key: string]: unknown }) => Promise<{ error: AuthError | Error | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  
  // Navigation helpers
  redirectToLogin: () => void;
  redirectToDashboard: () => void;
  
  // Subscription helpers
  refreshSubscriptionStatus: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [pipelineCount, setPipelineCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  // Navigation helpers
  const redirectToLogin = useCallback(() => {
    if (pathname !== '/login') router.push('/login');
  }, [pathname, router]);
  
  const redirectToDashboard = useCallback(() => {
    if (pathname !== '/dashboard') router.push('/dashboard');
  }, [pathname, router]);

  // Fetch user subscription data from database only
  const fetchUserSubscriptionData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('is_pro, pipeline_count')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user subscription data from database:', error);
        return;
      }
      
      // Set states directly from database values
      setPipelineCount(data?.pipeline_count || 0);
      setIsPro(data?.is_pro || false);
    } catch (error) {
      console.error('Error in fetchUserSubscriptionData:', error);
    }
  }, []);

  // Initialize auth state and set up listener
  useEffect(() => {
    // Initial session check
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setStatus('unauthenticated');
          return;
        }
        
        if (data.session) {
          setUser(data.session.user);
          setSession(data.session);
          setStatus('authenticated');
          
          // Fetch subscription data
          await fetchUserSubscriptionData(data.session.user.id);
          
          // Handle redirects for auth pages
          if (pathname === '/login' || pathname === '/signup') {
            redirectToDashboard();
          }
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setStatus('unauthenticated');
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Auth state change: ${event}`, newSession ? 'with session' : 'without session');
        
        // Update auth state based on event
        if (event === 'SIGNED_IN' && newSession) {
          setUser(newSession.user);
          setSession(newSession);
          setStatus('authenticated');
          fetchUserSubscriptionData(newSession.user.id);
          redirectToDashboard();
        } 
        else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setStatus('unauthenticated');
          
          // Redirect if needed
          if (pathname !== '/login' && pathname !== '/signup' && !pathname.startsWith('/auth/')) {
            redirectToLogin();
          }
        }
        else if (event === 'TOKEN_REFRESHED' && newSession) {
          setUser(newSession.user);
          setSession(newSession);
          setStatus('authenticated');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, redirectToDashboard, redirectToLogin, fetchUserSubscriptionData]);

  // Auth actions with loading state management
  const signIn = async (email: string, password: string) => {
    if (isAuthenticating) return { error: new Error('Authentication already in progress') as AuthError };
    
    try {
      setIsAuthenticating(true);
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const signUp = async (email: string, password: string, metadata?: { [key: string]: unknown }) => {
    if (isAuthenticating) return { error: new Error('Authentication already in progress') as AuthError };
    
    try {
      setIsAuthenticating(true);
      return await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const signInWithGoogle = async () => {
    if (isAuthenticating) return { error: new Error('Authentication already in progress') as AuthError };
    
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
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const signOut = async () => {
    if (isAuthenticating) return;
    
    try {
      setIsAuthenticating(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Function to refresh subscription status
  const refreshSubscriptionStatus = useCallback(async () => {
    if (user) {
      await fetchUserSubscriptionData(user.id);
    }
  }, [user, fetchUserSubscriptionData]);

  const value = {
    user,
    session,
    status,
    isAuthenticating,
    isPro,
    pipelineCount,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    redirectToLogin,
    redirectToDashboard,
    refreshSubscriptionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
