import { createClient } from '@supabase/supabase-js';
import { getOAuthCallbackUrl } from './environment';

// Initialize the Supabase client with explicit persistence configuration
const supabaseUrl = 'https://orgdcrdosuliwipdjybc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ2RjcmRvc3VsaXdpcGRqeWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzA5NzksImV4cCI6MjA1MzkwNjk3OX0.PzIA0Y5AKmFkehlYqcQFAiq0WybHpYrNtXoFC4k73RI';

// Create a storage object that safely handles SSR and ensures persistence
const storage = typeof window !== 'undefined' ? {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.error('Error getting item from localStorage:', e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error setting item in localStorage:', e);
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing item from localStorage:', e);
    }
  },
} : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

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

// Auth helper functions
export async function signInWithEmail(email: string, password: string) {
  try {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
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

export async function signOut() {
  try {
    return await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function signInWithOAuth(provider: 'google') {
  try {
    // Get the callback URL
    const redirectTo = getOAuthCallbackUrl();
    
    // Clear any existing auth state before starting new flow
    if (typeof window !== 'undefined') {
      try {
        // Clear all Supabase-related items from localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.') || key.startsWith('oxinews-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error('Error clearing auth state:', e);
      }
    }
    
    // Initiate OAuth flow
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // Force Google to prompt for account selection every time
        queryParams: {
          prompt: 'select_account',
          // Add a timestamp to force a new auth flow every time
          _t: Date.now().toString(),
        },
      },
    });
  } catch (error) {
    console.error('OAuth sign in error:', error);
    throw error;
  }
}
