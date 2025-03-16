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
    post_id = post_id[3:]
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
        
        print("url", url)
        print("headers", headers)
        print("params", params)

        # Make the request
        response = requests.get(url, headers=headers, params=params)
        

        # Check if request was successful
        if response.status_code == 200:
            # Extract permalink from the post data
            permalink = None
            for post in response.json().get('posts', []):
                if post.get('id') == post_id:
                    permalink = f"https://www.reddit.com{post.get('permalink')}"
                    break
            
            # If permalink not found in response, construct it
            if not permalink:
                permalink = f"https://www.reddit.com/r/{subreddit}/comments/{post_id}"

            return {
                "text": response.text,
                "permalink": permalink
            }
        else:
            logging.error(f"Error retrieving comments: {response.status_code} - {response.text}")
            return {
                "text": f"Error retrieving comments: {response.status_code}",
                "permalink": f"https://www.reddit.com/r/{subreddit}/comments/{post_id}"
            }
    except Exception as e:
        logging.error(f"Exception in get_comments_for_post: {str(e)}")
        return {
            "text": f"Error retrieving comments: {str(e)}",
            "permalink": f"https://www.reddit.com/r/{subreddit}/comments/{post_id}"
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
        # Debug: Print input data
        print(f"Selected posts: {len(selected_posts)}")
        print(f"Post data: {len(post_data)}")
        
        # Create a mapping of post_id to post data
        post_map = {post['post_id']: post for post in post_data}
        
        # Debug: Print post_map keys
        print(f"Post map keys: {list(post_map.keys())}")
        
        results = []
        
        # Process each selected post
        for selected in selected_posts:
            title = selected.get('title', '')
            post_ids = selected.get('related_post_ids', [])
            
            print(f"\nProcessing group: {title}")
            print(f"Post IDs in group: {post_ids}")
            
            post_comments = []
            
            # Get comments for each post ID
            for post_id in post_ids:
                print(f"  Processing post ID: {post_id}")
                
                # Check if post_id is in post_map
                if post_id in post_map:
                    post = post_map[post_id]
                    subreddit = post.get('subreddit', '')
                    print(f"    Found post in map. Subreddit: {subreddit}")
                    
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
                else:
                    print(f"    Post ID not found in post_map: {post_id}")
                    
                    # Try to find a matching post_id by removing 't3_' prefix
                    clean_post_id = post_id.replace('t3_', '')
                    matching_keys = [k for k in post_map.keys() if clean_post_id in k or k in post_id]
                    
                    if matching_keys:
                        print(f"    Found potential matches: {matching_keys}")
                        
                        # Use the first match
                        match_key = matching_keys[0]
                        post = post_map[match_key]
                        subreddit = post.get('subreddit', '')
                        print(f"    Using match: {match_key}, Subreddit: {subreddit}")
                        
                        # Get comments
                        comments = get_comments_for_post(
                            subreddit, 
                            match_key, 
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
