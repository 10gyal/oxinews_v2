"""
Reddit retrieval module for the pipeline.
"""
import logging
import sys
import os

# Add the parent directory to sys.path to import the reddit_api module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from run_pipeline.reddit_pipeline.reddit_api.client import RedditClient
from run_pipeline.reddit_pipeline.reddit_api.auth import RedditAuth
import config

def get_time_filter(schedule):
    """
    Convert schedule to Reddit time filter.
    
    Args:
        schedule (str): The schedule type ('daily', 'weekly', or 'monthly')
        
    Returns:
        str: Reddit time filter
    """
    if schedule == 'daily':
        return 'day'
    elif schedule == 'weekly':
        return 'week'
    elif schedule == 'monthly':
        return 'month'
    else:
        return 'day'  # Default to day

def get_top_posts(reddit_client, subreddit, time_filter='day', limit=25):
    """
    Get top posts from a subreddit.
    
    Args:
        reddit_client (RedditClient): Reddit client instance
        subreddit (str): Subreddit name
        time_filter (str): Time filter (day, week, month, year, all)
        limit (int): Maximum number of posts to retrieve
        
    Returns:
        list: List of post data
    """
    try:
        # Construct the API endpoint
        endpoint = f"/r/{subreddit}/top"
        
        # Set up the parameters
        params = {
            't': time_filter,
            'limit': limit
        }
        
        # Make the request
        response = reddit_client.make_request(endpoint, params=params)
        
        # Extract the posts from the response
        posts = []
        for child in response.get('data', {}).get('children', []):
            post_data = child.get('data', {})
            posts.append(post_data)
            
        return posts
    except Exception as e:
        logging.error(f"Error getting top posts from r/{subreddit}: {str(e)}")
        return []

def retrieve_reddit_posts(subreddits, schedule, comment_threshold=10):
    """
    Retrieve top posts from specified subreddits.
    
    Args:
        subreddits (list): List of subreddit names
        schedule (str): The schedule type ('daily', 'weekly', or 'monthly')
        comment_threshold (int): Minimum number of comments required
        
    Returns:
        list: List of post data
    """
    try:
        # Initialize Reddit client
        auth = RedditAuth(
            client_id=config.REDDIT_CLIENT_ID,
            client_secret=config.REDDIT_CLIENT_SECRET,
            user_agent=config.REDDIT_USER_AGENT
        )
        reddit_client = RedditClient(auth)
        
        # Clean and prepare subreddit list
        subreddit_list = []
        for subreddit in subreddits:
            # Handle comma-separated strings or lists
            if isinstance(subreddit, str):
                for s in subreddit.split(','):
                    cleaned = s.strip().replace('r/', '')
                    if cleaned:
                        subreddit_list.append(cleaned)
            else:
                cleaned = str(subreddit).strip().replace('r/', '')
                if cleaned:
                    subreddit_list.append(cleaned)
        
        if not subreddit_list:
            logging.warning("No valid subreddits provided")
            return []
        
        # Get time filter based on schedule
        time_filter = get_time_filter(schedule)
        
        # Retrieve posts from each subreddit
        all_posts = []
        for subreddit in subreddit_list:
            try:
                posts = get_top_posts(reddit_client, subreddit, time_filter=time_filter)

                if posts:
                    # Format posts according to required structure
                    for post in posts:
                        if post.get('num_comments', 0) >= comment_threshold:
                            formatted_post = {
                                "subreddit": post.get('subreddit', ''),
                                "score": post.get('score', 0),
                                "subreddit_id": post.get('subreddit_id', ''),
                                "num_comments": post.get('num_comments', 0),
                                "permalink": post.get('permalink', ''),
                                "created_utc": post.get('created_utc', 0),
                                "post_id": post.get('name', ''),  # 'name' field contains the post ID (e.g., t3_1jb1eez)
                                "post_content": f"{post.get('title', '')}\n{post.get('selftext', '')}"
                            }
                        all_posts.append(formatted_post)
            except Exception as e:
                logging.error(f"Error retrieving posts from r/{subreddit}: {str(e)}")
                continue
        
        return all_posts
    except Exception as e:
        logging.error(f"Error in retrieve_reddit_posts: {str(e)}")
        return []
