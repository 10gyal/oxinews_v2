#!/usr/bin/env python3
"""
Reddit Authentication Module

This module handles authentication with Reddit's API using OAuth2.
"""

import time
import logging
import requests
from typing import Dict, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RedditAuth:
    """Handles authentication with Reddit's API."""
    
    # Reddit API endpoints
    AUTH_URL = "https://www.reddit.com/api/v1/access_token"
    
    def __init__(
        self, 
        client_id: str, 
        client_secret: str, 
        user_agent: str,
        username: Optional[str] = None,
        password: Optional[str] = None
    ):
        """
        Initialize the Reddit authentication handler.
        
        Args:
            client_id: Reddit API client ID
            client_secret: Reddit API client secret
            user_agent: User agent string for API requests
            username: Reddit username (optional, for script apps)
            password: Reddit password (optional, for script apps)
        """
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_agent = user_agent
        self.username = username
        self.password = password
        self.token = None
        self.token_expiry = 0
        
    def get_auth_headers(self) -> Dict[str, str]:
        """
        Get authentication headers for API requests.
        
        Returns:
            Dict containing the authorization headers
        """
        if not self.token or time.time() > self.token_expiry:
            self._refresh_token()
            
        return {
            "Authorization": f"Bearer {self.token}",
            "User-Agent": self.user_agent
        }
    
    def _refresh_token(self) -> None:
        """Refresh the OAuth token."""
        auth = (self.client_id, self.client_secret)
        
        if self.username and self.password:
            # Script app authentication (username/password)
            data = {
                "grant_type": "password",
                "username": self.username,
                "password": self.password
            }
        else:
            # Application-only authentication
            data = {"grant_type": "client_credentials"}
            
        headers = {"User-Agent": self.user_agent}
        
        try:
            response = requests.post(
                self.AUTH_URL, 
                auth=auth, 
                data=data, 
                headers=headers
            )
            response.raise_for_status()
            
            token_data = response.json()
            self.token = token_data["access_token"]
            # Set expiry time (with a small buffer)
            self.token_expiry = time.time() + token_data["expires_in"]
            logger.info(f"Token expires at: {self.token_expiry}")
            logger.info("Successfully refreshed Reddit API token")
            
        except requests.RequestException as e:
            logger.error(f"Failed to refresh token: {str(e)}")
            raise
