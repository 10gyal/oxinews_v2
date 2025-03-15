"""
Module for retrieving comments for Reddit posts.
"""
import requests
import logging
import config

def get_comments_for_post(subreddit, post_id, max_comment_depth=5):
    """
    Retrieve comments for a Reddit post using the comments API.
    
    Args:
        subreddit (str): The subreddit name
        post_id (str): The post ID
        max_comment_depth (int): Maximum depth of comments to retrieve
        
    Returns:
        dict: Dictionary containing text and permalink
    """
    try:
        # Prepare API request
        url = config.COMMENTS_API_URL
        headers = {
            'subreddit': subreddit,
            'postid': post_id
        }
        params = {
            'max_comment_depth': max_comment_depth
        }
        
        # Make the request
        response = requests.get(url, headers=headers, params=params)
        
        # Check if request was successful
        if response.status_code == 200:
            # Extract permalink from the post data
            permalink = None
            for post in response.json().get('posts', []):
                if post.get('id') == post_id.replace('t3_', ''):
                    permalink = f"https://www.reddit.com{post.get('permalink')}"
                    break
            
            # If permalink not found in response, construct it
            if not permalink:
                permalink = f"https://www.reddit.com/r/{subreddit}/comments/{post_id.replace('t3_', '')}"
            
            return {
                "text": response.text,
                "permalink": permalink
            }
        else:
            logging.error(f"Error retrieving comments: {response.status_code} - {response.text}")
            return {
                "text": f"Error retrieving comments: {response.status_code}",
                "permalink": f"https://www.reddit.com/r/{subreddit}/comments/{post_id.replace('t3_', '')}"
            }
    except Exception as e:
        logging.error(f"Exception in get_comments_for_post: {str(e)}")
        return {
            "text": f"Error retrieving comments: {str(e)}",
            "permalink": f"https://www.reddit.com/r/{subreddit}/comments/{post_id.replace('t3_', '')}"
        }

def get_comments_for_posts(selected_posts, post_data, max_comment_depth=5):
    """
    Retrieve comments for multiple posts.
    
    Args:
        selected_posts (list): List of selected posts with titles and related_post_ids
        post_data (list): Original post data from reddit_retrieval
        max_comment_depth (int): Maximum depth of comments to retrieve
        
    Returns:
        list: List of posts with comments
    """
    try:
        # Create a mapping of post_id to post data
        post_map = {post['post_id']: post for post in post_data}
        
        results = []
        
        # Process each selected post
        for selected in selected_posts:
            title = selected.get('title', '')
            post_ids = selected.get('related_post_ids', [])
            
            post_comments = []
            
            # Get comments for each post ID
            for post_id in post_ids:
                if post_id in post_map:
                    post = post_map[post_id]
                    subreddit = post.get('subreddit', '')
                    
                    # Get comments
                    comments = get_comments_for_post(
                        subreddit, 
                        post_id, 
                        max_comment_depth
                    )
                    
                    post_comments.append({
                        'post': post,
                        'comments': comments
                    })
            
            # Add to results
            if post_comments:
                results.append({
                    'title': title,
                    'posts': post_comments
                })
        
        return results
    except Exception as e:
        logging.error(f"Error in get_comments_for_posts: {str(e)}")
        return []
