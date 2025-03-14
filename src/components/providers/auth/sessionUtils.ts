import { Session } from "@supabase/supabase-js";
import { useCallback } from "react";

export function useSessionUtils() {
  // Helper to check if a session is expired
  const isSessionExpired = useCallback((session: Session | null): boolean => {
    if (!session || !session.expires_at) return true;
    
    const expiresAt = new Date(session.expires_at * 1000);
    return expiresAt < new Date();
  }, []);

  return {
    isSessionExpired
  };
}
