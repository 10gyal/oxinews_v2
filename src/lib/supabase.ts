import { createClient } from '@supabase/supabase-js';

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

export async function signInWithOAuth(provider: 'google') {
  // Get the current origin, ensuring it's the full URL with protocol
  let redirectUrl = '';
  if (typeof window !== 'undefined') {
    // For production, ensure we're using https
    const protocol = window.location.hostname === 'localhost' ? 'http' : 'https';
    const host = window.location.host; // Includes hostname and port if present
    redirectUrl = `${protocol}://${host}/auth/callback`;
  }
  
  console.log("OAuth redirect URL:", redirectUrl);
  
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      // Specify scopes to request user's profile information
      scopes: 'email profile',
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
