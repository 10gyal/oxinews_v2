#!/usr/bin/env python3
"""
Example usage of the Reddit Posts Fetcher package.

This script demonstrates how to use the Reddit API client
to fetch posts from Reddit subreddits.
"""

import os
import json
from typing import Dict, Any

from reddit_api import create_reddit_client, get_posts_from_env

def print_post(post: Dict[str, Any], index: int = None) -> None:
    """
    Print a formatted post.
    
    Args:
        post: Post dictionary
        index: Optional index for numbering
    """
    prefix = f"{index}. " if index is not None else ""
    print(f"{prefix}Title: {post['title']}")
    print(f"   Author: {post['author']}")
    print(f"   Score: {post['score']} | Comments: {post['num_comments']}")
    print(f"   URL: {post['url']}")
    print(f"   Created: {post['created_date']}")
    
    if post['is_self'] and post['selftext']:
        # Truncate long text
        text = post['selftext']
        if len(text) > 200:
            text = text[:197] + "..."
        print(f"   Text: {text}")
        
    if post['media_type']:
        print(f"   Media: {post['media_type']} - {post['media_url']}")
        
    print()

def example_with_env_vars():
    """Example using environment variables."""
    print("=== Fetching posts using environment variables ===")
    try:
        posts = get_posts_from_env()
        subreddit = os.environ.get("REDDIT_SUBREDDIT", "python")
        print(f"Retrieved {len(posts)} posts from r/{subreddit}")
        
        # Print first 5 posts
        for i, post in enumerate(posts[:5], 1):
            print_post(post, i)
            
    except Exception as e:
        print(f"Error: {str(e)}")

def example_with_direct_auth():
    """Example with direct authentication."""
    print("\n=== Fetching posts with direct authentication ===")
    
    # These would typically come from a config file or environment variables
    # but are shown here for demonstration purposes
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    user_agent = os.environ.get("REDDIT_USER_AGENT", "python:reddit-posts-example:v1.0 (by /u/username)")
    
    if not all([client_id, client_secret]):
        print("Missing credentials. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.")
        return
    
    try:
        # Create client
        reddit = create_reddit_client(client_id, client_secret, user_agent)
        
        # Get posts from a specific subreddit
        subreddit = "programming"
        posts = reddit.get_posts(subreddit, limit=3, sort="hot")
        print(f"Retrieved {len(posts)} hot posts from r/{subreddit}")
        
        for i, post in enumerate(posts, 1):
            print_post(post, i)
            
        # Get top posts from another subreddit
        subreddit = "python"
        posts = reddit.get_posts(subreddit, limit=3, sort="top", timeframe="week")
        print(f"\nRetrieved {len(posts)} top posts this week from r/{subreddit}")
        
        for i, post in enumerate(posts, 1):
            print_post(post, i)
            
        # Search for posts
        query = "django"
        posts = reddit.search_subreddit(subreddit, query, limit=3)
        print(f"\nSearch results for '{query}' in r/{subreddit}")
        
        for i, post in enumerate(posts, 1):
            print_post(post, i)
            
    except Exception as e:
        print(f"Error: {str(e)}")

def save_posts_to_json(subreddit: str, filename: str, limit: int = 10):
    """
    Save posts from a subreddit to a JSON file.
    
    Args:
        subreddit: Subreddit name
        filename: Output JSON filename
        limit: Number of posts to retrieve
    """
    print(f"\n=== Saving posts from r/{subreddit} to {filename} ===")
    
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    user_agent = os.environ.get("REDDIT_USER_AGENT", "python:reddit-posts-example:v1.0 (by /u/username)")
    
    if not all([client_id, client_secret]):
        print("Missing credentials. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET environment variables.")
        return
    
    try:
        # Create client and get posts
        reddit = create_reddit_client(client_id, client_secret, user_agent)
        posts = reddit.get_posts(subreddit, limit=limit)
        
        # Save to JSON file
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2)
            
        print(f"Successfully saved {len(posts)} posts to {filename}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    print("Reddit Posts Fetcher Example")
    print("===========================")
    print("This example demonstrates how to use the Reddit Posts Fetcher package.")
    print("To run this example, you need Reddit API credentials.\n")
    
    # Check if credentials are set
    if not os.environ.get("REDDIT_CLIENT_ID") or not os.environ.get("REDDIT_CLIENT_SECRET"):
        print("Reddit API credentials not found in environment variables.")
        print("Please set the following environment variables:")
        print("  - REDDIT_CLIENT_ID: Your Reddit API client ID")
        print("  - REDDIT_CLIENT_SECRET: Your Reddit API client secret")
        print("  - REDDIT_USER_AGENT: A user agent string identifying your app")
        print("  - REDDIT_SUBREDDIT: (Optional) Default subreddit to fetch posts from")
        print("\nYou can get these credentials by creating a Reddit app at:")
        print("https://www.reddit.com/prefs/apps")
        exit(1)
    
    # Run examples
    example_with_env_vars()
    example_with_direct_auth()
    
    # Save posts to JSON
    save_posts_to_json("python", "python_posts.json", 20)
