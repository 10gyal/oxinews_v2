import { createClient } from '@supabase/supabase-js';
import { getOAuthCallbackUrl } from './environment';

// Initialize the Supabase client
const supabaseUrl = 'https://orgdcrdosuliwipdjybc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ2RjcmRvc3VsaXdpcGRqeWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzA5NzksImV4cCI6MjA1MzkwNjk3OX0.PzIA0Y5AKmFkehlYqcQFAiq0WybHpYrNtXoFC4k73RI';

// Create a simple storage adapter for SSR compatibility
const createStorageAdapter = () => {
  if (typeof window === 'undefined') {
    // Server-side rendering - return dummy storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  // Client-side - return localStorage adapter
  return {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
    removeItem: (key: string) => window.localStorage.removeItem(key),
  };
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'oxinews-auth-token',
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: createStorageAdapter(),
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

// OAuth sign in helper
export async function signInWithOAuth(provider: 'google') {
  try {
    const redirectTo = getOAuthCallbackUrl();
    
    // Clean up any app-specific OAuth data
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('oxinews-oauth-timestamp');
      window.localStorage.removeItem('oxinews-oauth-provider');
    }
    
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
        scopes: 'email profile',
      },
    });
  } catch (error) {
    console.error('OAuth sign in error:', error);
    return { error };
  }
}
