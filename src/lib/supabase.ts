import { createClient } from '@supabase/supabase-js';
import { getOAuthCallbackUrl } from './environment';

// Initialize the Supabase client with explicit persistence configuration
const supabaseUrl = 'https://orgdcrdosuliwipdjybc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ2RjcmRvc3VsaXdpcGRqeWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzA5NzksImV4cCI6MjA1MzkwNjk3OX0.PzIA0Y5AKmFkehlYqcQFAiq0WybHpYrNtXoFC4k73RI';

// Create a more robust storage object that safely handles SSR and ensures persistence
const createStorageAdapter = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return dummy storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Client-side - return enhanced localStorage adapter
  return {
    getItem: (key: string) => {
      try {
        const item = window.localStorage.getItem(key);
        console.log(`Storage: Retrieved ${key}`, item ? 'found' : 'not found');
        return item;
      } catch (e) {
        console.error(`Storage: Error getting ${key} from localStorage:`, e);
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        console.log(`Storage: Setting ${key}`);
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.error(`Storage: Error setting ${key} in localStorage:`, e);
      }
    },
    removeItem: (key: string) => {
      try {
        console.log(`Storage: Removing ${key}`);
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error(`Storage: Error removing ${key} from localStorage:`, e);
      }
    },
  };
};

const storage = createStorageAdapter();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'oxinews-auth-token',
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
    storage,
  },
  global: {
    headers: {
      'x-application-name': 'oxinews',
    },
  },
});

// Helper function to check if session exists
export async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error checking session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Exception checking session:', error);
    return null;
  }
}

// Auth helper functions
export async function signInWithEmail(email: string, password: string) {
  try {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Log session status after sign in
    if (result.data.session) {
      console.log('Email sign-in successful, session established');
    } else {
      console.log('Email sign-in completed but no session found');
    }
    
    return result;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, metadata?: { [key: string]: unknown }) {
  try {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

// Improved signOut function with atomic operations
export async function signOut() {
  try {
    console.log('Starting sign out process...');
    
    // First, get the current session to check if we're actually signed in
    const { data: sessionData } = await supabase.auth.getSession();
    const hasSession = !!sessionData.session;
    
    if (!hasSession) {
      console.log('No active session found during sign out');
    }
    
    // Create a list of app-specific keys to clean up
    const appKeys = ['oxinews-oauth-timestamp', 'oxinews-oauth-provider'];
    
    // Perform the sign out - this will handle clearing Supabase's own storage
    const result = await supabase.auth.signOut();
    
    // Additional cleanup for app-specific items only
    if (typeof window !== 'undefined') {
      try {
        // Clear only our app-specific items, let Supabase handle its own storage
        appKeys.forEach(key => {
          try {
            window.localStorage.removeItem(key);
          } catch (e) {
            console.error(`Error removing ${key}:`, e);
          }
        });
        
        console.log('App-specific local storage cleanup completed');
      } catch (e) {
        console.error('Error during localStorage cleanup:', e);
      }
    }
    
    console.log('Sign out process completed');
    return result;
  } catch (error) {
    console.error('Sign out error:', error);
    // Return the error instead of throwing it to prevent unhandled rejections
    return { error };
  }
}

export async function signInWithOAuth(provider: 'google') {
  try {
    // Get the callback URL
    const redirectTo = getOAuthCallbackUrl();
    console.log("OAuth redirect URL:", redirectTo);
    
    // DO NOT clear any auth state before starting new flow
    // This was causing the PKCE code verifier to be lost
    
    // Add a unique timestamp to ensure a fresh OAuth flow
    const timestamp = Date.now();
    
    // Store the timestamp before initiating OAuth flow
    if (typeof window !== 'undefined') {
      try {
        // Store timestamp and provider info
        window.localStorage.setItem('oxinews-oauth-timestamp', timestamp.toString());
        window.localStorage.setItem('oxinews-oauth-provider', provider);
        
        // Ensure we don't have conflicting session data
        const currentSession = await checkSession();
        if (currentSession) {
          console.log('Existing session found before OAuth flow, this is normal');
        }
      } catch (e) {
        console.error('Error preparing for OAuth flow:', e);
      }
    }
    
    // Initiate OAuth flow
    const result = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // Force Google to prompt for account selection every time
        queryParams: {
          prompt: 'select_account',
          // Add a timestamp to force a new auth flow every time
          _t: timestamp.toString(),
        },
        // Add a unique state parameter to help with PKCE flow
        scopes: 'email profile',
      },
    });
    
    if (result.error) {
      console.error("OAuth initialization error:", result.error);
    } else if (result.data?.url) {
      console.log("OAuth provider URL:", result.data.url);
      console.log("Redirecting to OAuth provider...");
    }
    
    return result;
  } catch (error) {
    console.error('OAuth sign in error:', error);
    throw error;
  }
}
