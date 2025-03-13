#!/usr/bin/env python3
"""
Reddit Posts Module

This module provides functionality to fetch and process posts from Reddit subreddits.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

from .client import RedditClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SubredditPosts:
    """Handles fetching and processing posts from subreddits."""
    
    def __init__(self, client: RedditClient):
        """
        Initialize the subreddit posts handler.
        
        Args:
            client: RedditClient instance
        """
        self.client = client
        
    def get_posts(
        self,
        subreddit: str,
        limit: int = 25,
        sort: str = "hot",
        timeframe: str = "day",
        after: Optional[str] = None,
        before: Optional[str] = None,
        filter_nsfw: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get posts from a subreddit.
        
        Args:
            subreddit: Name of the subreddit (without r/)
            limit: Maximum number of posts to retrieve (max 100)
            sort: Sort method ('hot', 'new', 'top', 'rising', 'controversial')
            timeframe: Timeframe for 'top' and 'controversial' ('hour', 'day', 'week', 'month', 'year', 'all')
            after: Fullname of an item to fetch results after
            before: Fullname of an item to fetch results before
            filter_nsfw: Whether to filter out NSFW posts
            
        Returns:
            List of post dictionaries
        """
        # Validate parameters
        if limit > 100:
            logger.warning("Limit exceeds maximum of 100, setting to 100")
            limit = 100
            
        valid_sorts = ["hot", "new", "top", "rising", "controversial"]
        if sort not in valid_sorts:
            raise ValueError(f"Invalid sort method. Must be one of: {', '.join(valid_sorts)}")
            
        valid_timeframes = ["hour", "day", "week", "month", "year", "all"]
        if sort in ["top", "controversial"] and timeframe not in valid_timeframes:
            raise ValueError(f"Invalid timeframe. Must be one of: {', '.join(valid_timeframes)}")
        
        # Build request parameters
        params = {
            "limit": limit,
        }
        
        if after:
            params["after"] = after
        if before:
            params["before"] = before
            
        if sort in ["top", "controversial"]:
            params["t"] = timeframe
            
        # Make the request
        endpoint = f"/r/{subreddit}/{sort}"
        response = self.client.make_request(endpoint, params=params)
        
        # Process the posts
        posts = []
        for post in response.get("data", {}).get("children", []):
            post_data = post.get("data", {})
            
            # Filter NSFW content if requested
            if filter_nsfw and post_data.get("over_18", False):
                continue
                
            posts.append(self._process_post(post_data))
            
        return posts
    
    def _process_post(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a raw post from the API into a cleaner format.
        
        Args:
            post_data: Raw post data from the API
            
        Returns:
            Processed post dictionary
        """
        # Convert created timestamp to datetime
        created_utc = post_data.get("created_utc", 0)
        created_date = datetime.fromtimestamp(created_utc)
        
        # Extract media information
        media_type = None
        media_url = None
        
        if post_data.get("is_video", False):
            media_type = "video"
            if "media" in post_data and "reddit_video" in post_data["media"]:
                media_url = post_data["media"]["reddit_video"].get("fallback_url")
        elif post_data.get("post_hint") == "image":
            media_type = "image"
            media_url = post_data.get("url")
        elif "gallery_data" in post_data:
            media_type = "gallery"
            # Gallery URLs require additional processing
            media_url = "gallery"  # Placeholder
            
        # Create a cleaner post object
        processed_post = {
            "id": post_data.get("id"),
            "fullname": post_data.get("name"),
            "subreddit": post_data.get("subreddit"),
            "title": post_data.get("title"),
            "author": post_data.get("author"),
            "created_utc": created_utc,
            "created_date": created_date.isoformat(),
            "score": post_data.get("score", 0),
            "upvote_ratio": post_data.get("upvote_ratio", 0),
            "num_comments": post_data.get("num_comments", 0),
            "permalink": post_data.get("permalink"),
            "url": post_data.get("url"),
            "is_self": post_data.get("is_self", False),
            "selftext": post_data.get("selftext", ""),
            "media_type": media_type,
            "media_url": media_url,
            "flair": post_data.get("link_flair_text"),
            "is_nsfw": post_data.get("over_18", False),
            "is_spoiler": post_data.get("spoiler", False),
            "is_stickied": post_data.get("stickied", False),
        }
        
        return processed_post
    
    def search_subreddit(
        self,
        subreddit: str,
        query: str,
        sort: str = "relevance",
        timeframe: str = "all",
        limit: int = 25,
        filter_nsfw: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Search for posts in a subreddit.
        
        Args:
            subreddit: Name of the subreddit (without r/)
            query: Search query
            sort: Sort method ('relevance', 'hot', 'new', 'top', 'comments')
            timeframe: Timeframe ('hour', 'day', 'week', 'month', 'year', 'all')
            limit: Maximum number of posts to retrieve (max 100)
            filter_nsfw: Whether to filter out NSFW posts
            
        Returns:
            List of post dictionaries
        """
        # Validate parameters
        if limit > 100:
            limit = 100
            
        valid_sorts = ["relevance", "hot", "new", "top", "comments"]
        if sort not in valid_sorts:
            raise ValueError(f"Invalid sort method. Must be one of: {', '.join(valid_sorts)}")
            
        valid_timeframes = ["hour", "day", "week", "month", "year", "all"]
        if timeframe not in valid_timeframes:
            raise ValueError(f"Invalid timeframe. Must be one of: {', '.join(valid_timeframes)}")
        
        # Build request parameters
        params = {
            "q": query,
            "restrict_sr": True,  # Restrict to subreddit
            "sort": sort,
            "t": timeframe,
            "limit": limit
        }
        
        # Make the request
        endpoint = f"/r/{subreddit}/search"
        response = self.client.make_request(endpoint, params=params)
        
        # Process the posts
        posts = []
        for post in response.get("data", {}).get("children", []):
            post_data = post.get("data", {})
            
            # Filter NSFW content if requested
            if filter_nsfw and post_data.get("over_18", False):
                continue
                
            posts.append(self._process_post(post_data))
            
        return posts
