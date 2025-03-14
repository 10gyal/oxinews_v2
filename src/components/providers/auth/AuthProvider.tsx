"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

import { AuthContext } from "./authContext";
import { useAuthActions } from "./authActions";
import { useAuthNavigation } from "./navigationHelpers";
import { useStateLock } from "./stateLock";
import { useSessionUtils } from "./sessionUtils";
import { AuthStatus } from "./types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const isInitializing = useRef(true);
  
  // Router
  const pathname = usePathname();

  // Custom hooks
  const { redirectToLogin, redirectToDashboard } = useAuthNavigation();
  const { acquireLock, releaseLock } = useStateLock();
  const { isSessionExpired } = useSessionUtils();
  const { signIn, signUp, signInWithGoogle, handleSignOut } = useAuthActions(redirectToLogin);

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
          await handleSignOut(acquireLock, releaseLock);
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
            await handleSignOut(acquireLock, releaseLock);
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
    signOut: () => handleSignOut(acquireLock, releaseLock),
    
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
    acquireLock,
    releaseLock,
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
