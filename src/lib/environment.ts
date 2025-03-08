/**
 * Utility functions for environment detection and configuration
 */

/**
 * Determines if the application is running in development mode
 * @returns boolean indicating if in development mode
 */
export function isDevelopmentEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'development' || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  );
}

/**
 * Gets the base URL for the current environment
 * @returns The base URL (e.g., http://localhost:3000 in development, https://oxinews.com in production)
 */
export function getBaseUrl(): string {
  if (isDevelopmentEnvironment()) {
    return 'http://localhost:3000';
  }
  
  return process.env.NEXT_PUBLIC_URL || 
         (typeof window !== 'undefined' ? window.location.origin : '');
}

/**
 * Gets the callback URL for OAuth authentication
 * @returns The full callback URL
 */
export function getOAuthCallbackUrl(): string {
  return `${getBaseUrl()}/auth/callback`;
}

/**
 * Creates a full URL with the correct base URL for the current environment
 * @param path The path to append to the base URL
 * @returns The full URL
 */
export function createEnvironmentUrl(path: string): string {
  // Ensure the path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${formattedPath}`;
}
