/**
 * Validates an email address format
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a subreddit name format
 * @param subreddit The subreddit name to validate
 * @returns The cleaned subreddit name (without r/ prefix)
 */
export const cleanSubredditName = (subreddit: string): string => {
  // Remove "r/" prefix if user types it
  return subreddit.startsWith("r/") ? subreddit.substring(2) : subreddit;
};

/**
 * Formats subreddit names to include r/ prefix
 * @param subreddits Array of subreddit names
 * @returns Array of formatted subreddit names with r/ prefix
 */
export const formatSubreddits = (subreddits: string[]): string[] => {
  return subreddits.map(subreddit => 
    subreddit.startsWith("r/") ? subreddit : `r/${subreddit}`
  );
};
