"""
Reddit Posts Fetcher Package

This package provides functionality to fetch posts from Reddit subreddits
using Reddit's official API with OAuth2 authentication.
"""

from .auth import RedditAuth
from .client import RedditClient
from .posts import SubredditPosts
from .utils import create_reddit_client, get_posts_from_env

__all__ = [
    'RedditAuth',
    'RedditClient',
    'SubredditPosts',
    'create_reddit_client',
    'get_posts_from_env',
]
