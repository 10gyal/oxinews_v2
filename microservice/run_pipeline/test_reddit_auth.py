"""
Test script for Reddit API authentication.
"""
import os
import sys
import requests
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_reddit_auth():
    """
    Test Reddit API authentication using credentials from .env file.
    """
    # Load environment variables
    load_dotenv()
    
    # Get Reddit API credentials
    client_id = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    user_agent = os.getenv('REDDIT_USER_AGENT', 'OxiNews Pipeline Service v1.0')
    
    # Check if credentials are provided
    if not client_id or not client_secret:
        logger.error("Missing Reddit API credentials. Please set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in your .env file.")
        return False
    
    # Print credentials (masked for security)
    print(f"Client ID: {client_id[:4]}...{client_id[-4:] if len(client_id) > 8 else ''}")
    print(f"Client Secret: {client_secret[:4]}...{client_secret[-4:] if len(client_secret) > 8 else ''}")
    print(f"User Agent: {user_agent}")
    
    # Try to authenticate with Reddit API
    auth_url = "https://www.reddit.com/api/v1/access_token"
    auth = (client_id, client_secret)
    headers = {"User-Agent": user_agent}
    data = {"grant_type": "client_credentials"}
    
    print("\nAttempting to authenticate with Reddit API...")
    
    try:
        response = requests.post(
            auth_url, 
            auth=auth, 
            data=data, 
            headers=headers
        )
        
        # Check if request was successful
        if response.status_code == 200:
            token_data = response.json()
            print("\n✅ Authentication successful!")
            print(f"Access Token: {token_data['access_token'][:10]}...")
            print(f"Token Type: {token_data.get('token_type', 'bearer')}")
            print(f"Expires In: {token_data.get('expires_in', 3600)} seconds")
            return True
        else:
            print(f"\n❌ Authentication failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Provide specific guidance based on error code
            if response.status_code == 401:
                print("\nPossible issues:")
                print("- Invalid client_id or client_secret")
                print("- Check that you're copying the credentials correctly from Reddit")
            elif response.status_code == 403:
                print("\nPossible issues:")
                print("- Reddit may be blocking your requests")
                print("- Your user agent might not be following Reddit's guidelines")
                print("- Try using a more descriptive user agent like: 'platform:app_name:version (by /u/username)'")
            elif response.status_code == 429:
                print("\nPossible issues:")
                print("- You're being rate limited by Reddit")
                print("- Wait a while before trying again")
            
            return False
    except requests.RequestException as e:
        print(f"\n❌ Request failed: {str(e)}")
        return False

def test_reddit_api():
    """
    Test a simple Reddit API call to verify authentication.
    """
    # First authenticate
    if not test_reddit_auth():
        return
    
    print("\nTesting a simple API call to r/announcements...")
    
    # Load environment variables
    load_dotenv()
    
    # Get Reddit API credentials
    client_id = os.getenv('REDDIT_CLIENT_ID')
    client_secret = os.getenv('REDDIT_CLIENT_SECRET')
    user_agent = os.getenv('REDDIT_USER_AGENT', 'OxiNews Pipeline Service v1.0')
    
    # Authenticate
    auth_url = "https://www.reddit.com/api/v1/access_token"
    auth = (client_id, client_secret)
    headers = {"User-Agent": user_agent}
    data = {"grant_type": "client_credentials"}
    
    try:
        auth_response = requests.post(
            auth_url, 
            auth=auth, 
            data=data, 
            headers=headers
        )
        auth_response.raise_for_status()
        token_data = auth_response.json()
        access_token = token_data["access_token"]
        
        # Make API call
        api_headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": user_agent
        }
        
        api_url = "https://oauth.reddit.com/r/announcements/hot"
        params = {"limit": 5}
        
        api_response = requests.get(
            api_url,
            headers=api_headers,
            params=params
        )
        api_response.raise_for_status()
        
        # Process response
        data = api_response.json()
        posts = data.get("data", {}).get("children", [])
        
        if posts:
            print("\n✅ API call successful!")
            print("\nSample posts from r/announcements:")
            for i, post in enumerate(posts, 1):
                post_data = post.get("data", {})
                title = post_data.get("title", "No title")
                author = post_data.get("author", "Unknown")
                print(f"{i}. {title} (by {author})")
        else:
            print("\n⚠️ API call successful but no posts returned")
            
    except requests.RequestException as e:
        print(f"\n❌ API call failed: {str(e)}")

if __name__ == "__main__":
    print("===== Reddit API Authentication Test =====\n")
    test_reddit_api()
    
    print("\n===== Troubleshooting Tips =====")
    print("1. Make sure your Reddit API credentials are correct")
    print("2. Use a descriptive user agent following Reddit's guidelines:")
    print("   Example: 'platform:app_name:version (by /u/username)'")
    print("3. Check if your IP address is being blocked by Reddit")
    print("4. Try creating a new Reddit API application")
    print("5. For script-type apps, you might need to provide username/password")
    print("\nFor more information, see: https://github.com/reddit-archive/reddit/wiki/OAuth2")
