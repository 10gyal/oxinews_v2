#!/usr/bin/env python3
"""
Reddit Client Module

This module provides a client for interacting with Reddit's API.
"""

import time
import logging
import requests
from typing import Dict, Optional, Any

from .auth import RedditAuth

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RedditClient:
    """Client for interacting with Reddit's API."""
    
    # Reddit API base URL
    BASE_URL = "https://oauth.reddit.com"
    
    def __init__(self, auth: RedditAuth):
        """
        Initialize the Reddit client.
        
        Args:
            auth: RedditAuth instance for authentication
        """
        self.auth = auth
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Minimum time between requests (seconds)
        
    def make_request(
        self, 
        endpoint: str, 
        method: str = "GET", 
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Reddit API with rate limiting.
        
        Args:
            endpoint: API endpoint to request
            method: HTTP method (GET, POST, etc.)
            params: URL parameters
            data: Request body data
            
        Returns:
            JSON response as a dictionary
        """
        # Implement simple rate limiting
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
            
        url = f"{self.BASE_URL}{endpoint}"
        headers = self.auth.get_auth_headers()
        
        try:
            self.last_request_time = time.time()
            
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, params=params, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            response.raise_for_status()
            return response.json()
            
        except requests.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            if hasattr(e.response, 'text'):
                logger.error(f"Response: {e.response.text}")
            raise
