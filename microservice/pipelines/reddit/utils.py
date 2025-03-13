#!/usr/bin/env python3
"""
Reddit Utilities Module

This module provides utility functions for working with the Reddit API.
"""

import os
import logging
from typing import Dict, List, Optional, Any

from .auth import RedditAuth
from .client import RedditClient
from .posts import SubredditPosts

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_reddit_client(
    client_id: str,
    client_secret: str,
    user_agent: str,
    username: Optional[str] = None,
    password: Optional[str] = None
) -> SubredditPosts:
    """
    Create a Reddit client for fetching subreddit posts.
    
    Args:
        client_id: Reddit API client ID
        client_secret: Reddit API client secret
        user_agent: User agent string for API requests
        username: Reddit username (optional, for script apps)
        password: Reddit password (optional, for script apps)
        
    Returns:
        SubredditPosts instance
    """
    auth = RedditAuth(client_id, client_secret, user_agent, username, password)
    client = RedditClient(auth)
    return SubredditPosts(client)


def get_posts_from_env() -> List[Dict[str, Any]]:
    """
    Get Reddit posts using environment variables for authentication.
    
    Environment variables:
        REDDIT_CLIENT_ID: Reddit API client ID
        REDDIT_CLIENT_SECRET: Reddit API client secret
        REDDIT_USER_AGENT: User agent string
        REDDIT_USERNAME: (Optional) Reddit username
        REDDIT_PASSWORD: (Optional) Reddit password
        REDDIT_SUBREDDIT: Subreddit to fetch posts from
        
    Returns:
        List of posts
    """
    # Get environment variables
    client_id = os.environ.get("REDDIT_CLIENT_ID")
    client_secret = os.environ.get("REDDIT_CLIENT_SECRET")
    user_agent = os.environ.get("REDDIT_USER_AGENT")
    username = os.environ.get("REDDIT_USERNAME")
    password = os.environ.get("REDDIT_PASSWORD")
    subreddit = os.environ.get("REDDIT_SUBREDDIT", "python")
    
    # Validate required environment variables
    if not all([client_id, client_secret, user_agent]):
        raise ValueError(
            "Missing required environment variables. "
            "Please set REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_USER_AGENT."
        )
    
    # Create client and fetch posts
    reddit = create_reddit_client(
        client_id, 
        client_secret, 
        user_agent, 
        username, 
        password
    )
    
    return reddit.get_posts(subreddit)
