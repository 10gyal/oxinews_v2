"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
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
  const isInitializing = useRef(true);
  // Improved mutex implementation with timeout protection
  const stateUpdateLock = useRef<{locked: boolean, timer: NodeJS.Timeout | null}>({
    locked: false,
    timer: null
  });
  
  // Router
  const router = useRouter();
  const pathname = usePathname();

  // Navigation helpers
  const redirectToLogin = useCallback(() => {
    console.log("Redirecting to login page:", "/login");
    router.push("/login");
  }, [router]);

  const redirectToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Auth actions wrapped in useCallback to prevent unnecessary re-renders
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await signInWithEmail(email, password);
      
      // No need to update state or redirect here - the auth state listener will handle it
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: { [key: string]: unknown }) => {
    try {
      const { error } = await signUpWithEmail(email, password, metadata);
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await signInWithOAuth('google');
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  // Helper function to safely acquire the state update lock with timeout protection
  const acquireLock = useCallback(() => {
    if (stateUpdateLock.current.locked) {
      return false;
    }
    
    stateUpdateLock.current.locked = true;
    
    // Set a safety timeout to release the lock after 5 seconds
    // This prevents deadlocks if an error occurs during a locked operation
    stateUpdateLock.current.timer = setTimeout(() => {
      console.warn("AuthProvider: Lock timeout triggered - forcing release");
      stateUpdateLock.current.locked = false;
      stateUpdateLock.current.timer = null;
    }, 5000);
    
    return true;
  }, []);
  
  // Helper function to safely release the lock
  const releaseLock = useCallback(() => {
    if (stateUpdateLock.current.timer) {
      clearTimeout(stateUpdateLock.current.timer);
      stateUpdateLock.current.timer = null;
    }
    stateUpdateLock.current.locked = false;
  }, []);

  // Improved sign out function with proper promise chaining
  const handleSignOut = useCallback(async () => {
    // Prevent multiple concurrent sign out attempts
    if (!acquireLock()) {
      console.log("AuthProvider: Sign out already in progress, skipping");
      return;
    }
    
    try {
      console.log("AuthProvider: Starting sign out process");
      
      // First set state to unauthenticated to prevent UI flicker
      setUser(null);
      setSession(null);
      setStatus('unauthenticated');
      
      // Then perform the actual sign out
      const { error } = await supabaseSignOut();
      
      if (error) {
        console.error("AuthProvider: Error signing out:", error);
      } else {
        console.log("AuthProvider: Sign out successful");
      }
      
      // Use Promise to ensure navigation happens after state is updated
      // and after a small delay to allow for any pending operations
      await new Promise(resolve => {
        // Use requestAnimationFrame for better timing with React's rendering cycle
        window.requestAnimationFrame(() => {
          setTimeout(resolve, 50);
        });
      });
      
      // Now it's safe to redirect
      redirectToLogin();
    } catch (error) {
      console.error("AuthProvider: Exception during sign out:", error);
      // Still redirect to login even if there was an error
      redirectToLogin();
    } finally {
      // Always release the lock, even if an error occurred
      releaseLock();
    }
  }, [acquireLock, releaseLock, redirectToLogin]);

  // Helper to check if a session is expired
  const isSessionExpired = useCallback((session: Session | null): boolean => {
    if (!session || !session.expires_at) return true;
    
    const expiresAt = new Date(session.expires_at * 1000);
    return expiresAt < new Date();
  }, []);
  
  // Initialize auth state and set up listener
  useEffect(() => {
    let mounted = true;
    
    // Function to get the current session and user
    const initializeAuth = async () => {
      // Try to acquire the lock, if we can't, another initialization is in progress
      if (!acquireLock()) return;
      
      try {
        // First check if session is expired BEFORE updating any state
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (mounted) {
            setStatus('unauthenticated');
            isInitializing.current = false;
          }
          return;
        }
        
        // Check session expiration first before proceeding with any state updates
        if (currentSession && isSessionExpired(currentSession)) {
          console.log("Auth initialization: Session expired, signing out");
          // Release the current lock before calling handleSignOut which will acquire its own lock
          releaseLock();
          await handleSignOut();
          return;
        }
        
        if (currentSession) {
          // If we have a session, get the user
          const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            if (mounted) {
              setStatus('unauthenticated');
              isInitializing.current = false;
            }
            return;
          }
          
          if (mounted) {
            // Update state atomically to prevent inconsistent state
            setSession(currentSession);
            setUser(currentUser);
            setStatus('authenticated');
            isInitializing.current = false;
            
            // If we're on the login page but already authenticated, redirect to dashboard
            if (pathname === '/login' || pathname === '/signup') {
              redirectToDashboard();
            }
          }
        } else {
          if (mounted) {
            // Update state atomically
            setSession(null);
            setUser(null);
            setStatus('unauthenticated');
            isInitializing.current = false;
          }
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        if (mounted) {
          setStatus('unauthenticated');
          isInitializing.current = false;
        }
      } finally {
        // Always release the lock
        releaseLock();
      }
    };

    // Set up timeout for auth initialization
    const initializationTimeout = setTimeout(() => {
      if (mounted && isInitializing.current) {
        setStatus('unauthenticated');
        isInitializing.current = false;
      }
    }, 5000); // 5 second timeout

    // Start initialization immediately
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Skip if component is unmounted or another auth operation is in progress
        if (!mounted) return;
        
        // Try to acquire the lock, if we can't, another auth operation is in progress
        if (!acquireLock()) {
          console.log(`Auth state change (${event}): Another operation in progress, skipping`);
          return;
        }

        console.log(`Auth state change event: ${event}`);
        
        try {
          // Check session expiration FIRST before any state updates
          if (newSession && isSessionExpired(newSession)) {
            console.log('Auth state change: Session expired');
            // Release the current lock before calling handleSignOut which will acquire its own lock
            releaseLock();
            await handleSignOut();
            return;
          }
          
          // Handle sign out event immediately
          if (event === 'SIGNED_OUT') {
            console.log('Auth state change: SIGNED_OUT detected');
            
            // Clear state atomically
            setUser(null);
            setSession(null);
            setStatus('unauthenticated');
            
            // Redirect if not already on auth pages
            if (pathname !== '/login' && 
                pathname !== '/signup' && 
                !pathname.startsWith('/auth/')) {
              
              // Use requestAnimationFrame for better timing with React's rendering cycle
              window.requestAnimationFrame(() => {
                redirectToLogin();
              });
            }
            return;
          }
          
          // For other events, update session state
          setSession(newSession);
          
          if (newSession) {
            // If we have a session, get and set the user
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('Auth state change: Error getting user', userError);
              setStatus('unauthenticated');
              return;
            }

            // Update state atomically
            setUser(currentUser);
            setStatus('authenticated');
            
            // Handle sign in event
            if (event === 'SIGNED_IN') {
              console.log('Auth state change: SIGNED_IN detected');
              redirectToDashboard();
            }
          } else {
            // No session
            console.log('Auth state change: No session found');
            // Update state atomically
            setUser(null);
            setSession(null);
            setStatus('unauthenticated');
          }
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          // Ensure we reset to unauthenticated state on error
          setUser(null);
          setSession(null);
          setStatus('unauthenticated');
        } finally {
          // Always release the lock
          releaseLock();
        }
      }
    );
    
    // Clean up subscription, timeout, and mounted flag on unmount
    return () => {
      mounted = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
      // Ensure initialization state is reset if component unmounts during initialization
      if (isInitializing.current) {
        isInitializing.current = false;
      }
    };
  }, [pathname, redirectToDashboard, redirectToLogin, handleSignOut, acquireLock, releaseLock, isSessionExpired]);

  // Create a stable auth context value using useMemo to prevent unnecessary re-renders
  const authContextValue = useMemo(() => ({
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
  }), [
    user, 
    session, 
    status, 
    signIn, 
    signUp, 
    signInWithGoogle, 
    handleSignOut, 
    redirectToLogin, 
    redirectToDashboard
  ]);

  // Provide auth context
  return (
    <AuthContext.Provider value={authContextValue}>
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
