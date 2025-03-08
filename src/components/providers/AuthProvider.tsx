"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { signOut, supabase } from "@/lib/supabase";
import { isDevelopmentEnvironment, createEnvironmentUrl } from "@/lib/environment";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      
      // Use the direct Supabase auth method to get the session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        // If we have a session, get the user data directly
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setSession(null);
      
      // Use window.location.href for a full page navigation to ensure we're using the correct domain
      if (typeof window !== 'undefined') {
        const loginUrl = createEnvironmentUrl('/login');
        console.log("Redirecting to:", loginUrl);
        window.location.href = loginUrl;
      } else {
        // Fallback to Next.js router if window is not available (SSR)
        router.push("/login");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check for an existing session and redirect if needed
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Use the direct Supabase auth method to get the session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession) {
          // If we have a session, get the user data directly
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setUser(currentUser || null);
          
          // If we already have a session after refresh, and we're on the login page,
          // redirect to dashboard
          if (window.location.pathname === '/login') {
            // Use window.location.href for a full page navigation to ensure we're using the correct domain
            if (typeof window !== 'undefined') {
              const dashboardUrl = createEnvironmentUrl('/dashboard');
              console.log("Already logged in, redirecting to:", dashboardUrl);
              window.location.href = dashboardUrl;
            } else {
              // Fallback to Next.js router if window is not available (SSR)
              router.replace("/dashboard");
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: Session | null) => {
        console.log("Auth state changed:", event);
        
        try {
          setIsLoading(true);
          setSession(newSession);
          
          if (newSession) {
            // Get the user data directly without delay
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser || null);
            
            // If the user just signed in, redirect to dashboard
            if (event === 'SIGNED_IN') {
              console.log("User signed in, redirecting to dashboard");
              console.log("Environment:", isDevelopmentEnvironment() ? "development" : "production");
              
              // Use window.location.href for a full page navigation to ensure we're using the correct domain
              if (typeof window !== 'undefined') {
                const dashboardUrl = createEnvironmentUrl('/dashboard');
                console.log("Redirecting to:", dashboardUrl);
                window.location.href = dashboardUrl;
              } else {
                // Fallback to Next.js router if window is not available (SSR)
                router.push("/dashboard");
              }
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error during auth state change:", error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]); // Include router in dependencies

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut: handleSignOut,
        refreshSession,
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
