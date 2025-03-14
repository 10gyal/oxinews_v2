import { useCallback } from "react";
import { signInWithEmail, signUpWithEmail, signInWithOAuth, signOut } from "@/lib/supabase";

export function useAuthActions(redirectToLogin: () => void) {
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

  // Improved sign out function with proper promise chaining
  const handleSignOut = useCallback(async (acquireLock: () => boolean, releaseLock: () => void) => {
    // Prevent multiple concurrent sign out attempts
    if (!acquireLock()) {
      console.log("AuthProvider: Sign out already in progress, skipping");
      return;
    }
    
    try {
      console.log("AuthProvider: Starting sign out process");
      
      // Then perform the actual sign out
      const { error } = await signOut();
      
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
  }, [redirectToLogin]);

  return {
    signIn,
    signUp,
    signInWithGoogle,
    handleSignOut
  };
}
