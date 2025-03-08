"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { getCurrentUser, getSession, signOut, supabase } from "@/lib/supabase";

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
      
      // First attempt to get the session
      let currentSession = await getSession();
      
      // If no session is found, try again after a short delay
      // This helps in cases where the session is still being established
      if (!currentSession) {
        await new Promise(resolve => setTimeout(resolve, 500));
        currentSession = await getSession();
      }
      
      setSession(currentSession);
      
      if (currentSession) {
        const currentUser = await getCurrentUser();
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
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Check for an existing session and redirect if needed
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        setIsLoading(true);
        
        // First attempt to get the session
        let currentSession = await getSession();
        
        // If no session is found, try again after a short delay
        // This helps in cases where the session is still being established
        if (!currentSession) {
          console.log("No session found on first attempt, retrying...");
          await new Promise(resolve => setTimeout(resolve, 800));
          currentSession = await getSession();
        }
        
        setSession(currentSession);
        
        if (currentSession) {
          console.log("Session found, getting user data...");
          const currentUser = await getCurrentUser();
          setUser(currentUser || null);
          
          // If we already have a session after refresh, and we're on the login page,
          // redirect to dashboard
          if (window.location.pathname === '/login') {
            console.log("Existing session found on login page, redirecting to dashboard");
            router.replace("/dashboard");
          }
        } else {
          console.log("No session found after retry");
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
      async (event: string, session: Session | null) => {
        console.log("Auth state changed:", event);
        
        try {
          setIsLoading(true);
          setSession(session);
          
          if (session) {
            // Add a small delay before getting the user
            // This ensures the session is fully established
            await new Promise(resolve => setTimeout(resolve, 500));
            const currentUser = await getCurrentUser();
            setUser(currentUser || null);
            
            // If the user just signed in, redirect to dashboard
            if (event === 'SIGNED_IN') {
              console.log("User signed in, redirecting to dashboard");
              router.push("/dashboard");
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
