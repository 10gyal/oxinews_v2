import { useCallback, useRef } from "react";

export function useStateLock() {
  // Improved mutex implementation with timeout protection
  const stateUpdateLock = useRef<{locked: boolean, timer: NodeJS.Timeout | null}>({
    locked: false,
    timer: null
  });
  
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

  return {
    acquireLock,
    releaseLock
  };
}
