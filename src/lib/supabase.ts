import { createClient } from '@supabase/supabase-js';
import { getOAuthCallbackUrl, isDevelopmentEnvironment } from './environment';

// Initialize the Supabase client
const supabaseUrl = 'https://orgdcrdosuliwipdjybc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZ2RjcmRvc3VsaXdpcGRqeWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMzA5NzksImV4cCI6MjA1MzkwNjk3OX0.PzIA0Y5AKmFkehlYqcQFAiq0WybHpYrNtXoFC4k73RI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email: string, password: string, metadata?: { [key: string]: unknown }) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function signInWithOAuth(provider: 'google', options?: { redirectTo?: string, metadata?: { [key: string]: unknown } }) {
  // Use the environment utility functions to get the appropriate callback URL
  const redirectTo = options?.redirectTo || getOAuthCallbackUrl();
  
  // Log environment information for debugging
  console.log('OAuth redirect using environment:', isDevelopmentEnvironment() ? 'development' : 'production');
  console.log('OAuth redirect URL:', redirectTo);
  
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      // Pass metadata as queryParams to be retrieved after authentication
      queryParams: options?.metadata ? 
        { metadata: JSON.stringify(options.metadata) } : 
        undefined,
    },
  });
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
