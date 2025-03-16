"""
Direct test script for the Reddit pipeline.
"""
import sys
import os
import json
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add necessary paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

# Import required modules
from reddit_retrieval import retrieve_reddit_posts
from reddit_pipeline.agents.post_selector import aggregate_posts
from reddit_pipeline.agents.writer import write_summary
from get_comments import get_comments_for_post, get_comments_for_posts
import db_utils
import config

"""
1. Retrieve posts from Reddit
2. Process posts for post_selector
3. Use the aggregate_posts function to get the post groups
4. For each post group, retrieve comments and then write a summary using the write_summary function
"""

def test_pipeline(pipeline_id):
    """
    Test the Reddit pipeline with a given pipeline_id.
    
    Args:
        pipeline_id (str): The ID of the pipeline to use
    """
    try:
        # Get pipeline configuration
        pipeline_config = db_utils.get_pipeline_config(pipeline_id)
        
        if not pipeline_config:
            print(f"Error: Pipeline not found: {pipeline_id}")
            return
        
        # Extract relevant pipeline parameters
        subreddits = pipeline_config.get('subreddits', [])
        schedule = pipeline_config.get('schedule', 'daily')
        focus = pipeline_config.get('focus', '')
        
        print(f"Pipeline: {pipeline_config.get('pipeline_name', '')} ({pipeline_id})")
        print(f"Focus: {focus}")
        print(f"Subreddits: {subreddits}")
        print(f"Schedule: {schedule}")

        # Step 1: Retrieve Reddit posts
        print("\nStep 1: Retrieving Reddit posts...")
        posts = retrieve_reddit_posts(
            subreddits=subreddits,
            schedule=schedule,
            comment_threshold=config.DEFAULT_COMMENT_THRESHOLD
        )
        print(f"Number of posts retrieved: {len(posts)}")
        
        if not posts:
            print("WARNING: No posts retrieved. Check subreddit names and Reddit API credentials.")
            return

        # Step 2: Process posts for post_selector
        print("\nStep 2: Processing posts for post_selector...")
        post_data = [{'post_id': post['post_id'], 'post_content': post['post_content']} for post in posts]
        
        # Step 3: Run post selector with aggregate_posts
        print("\nStep 3: Running post selector...")
        post_groups = aggregate_posts(post_data, focus)
        print(f"Number of post groups: {len(post_groups)}")
        
        if not post_groups:
            print("WARNING: No post groups were created. Check the focus topic and posts content.")
            return
        
        # Print post_groups structure
        for i, group in enumerate(post_groups):
            print(f"Group {i+1}: {group.get('title')}")
            print(f"  Post IDs: {group.get('related_post_ids', [])}")
        
        # Step 4 & 5: For each post group, retrieve comments and then write a summary
        print("\nStep 4 & 5: Processing each post group...")
        summaries = []
        
        for i, group in enumerate(post_groups):
            group_title = group.get('title')
            post_ids = group.get('related_post_ids', [])
            
            print(f"\nProcessing group {i+1}: {group_title}")
            print(f"Post IDs: {post_ids}")
            
            # Ensure post_ids don't have 't3_' prefix for URL construction
            processed_post_ids = [
                post_id.replace('t3_', '') if post_id.startswith('t3_') else post_id 
                for post_id in post_ids
            ]
            
            # Create a processed group for this specific group
            processed_group = {
                'title': group_title,
                'related_post_ids': processed_post_ids
            }
            
            # Step 4: Retrieve comments for this post group
            print(f"Retrieving comments for group: {group_title}")
            comments_result = get_comments_for_posts(
                selected_posts=[processed_group],  # Pass just this group
                post_data=posts,
                max_comment_depth=5
            )
            
            if not comments_result:
                print(f"WARNING: No comments retrieved for group: {group_title}")
                continue
            
            print(f"Retrieved comments for group: {group_title}")
            
            # Step 5: Write summary for this post group
            group_data = comments_result[0]  # Get the first (and only) group result
            posts_with_comments = group_data.get('posts', [])
            
            print(f"Number of posts with comments: {len(posts_with_comments)}")
            
            # Prepare discussions for the writer
            post_discussions = []
            for post_with_comments in posts_with_comments:
                comments_data = post_with_comments.get('comments', {})
                post_discussions.append({
                    'title': group_data.get('title', ''),
                    'text': comments_data.get('text', ''),
                    'permalink': comments_data.get('permalink', '')
                })
            
            print(f"Post discussions: {post_discussions}")
            # Generate summary
            if post_discussions:
                print(f"Generating summary for group: {group_title}")
                # Pass the group title as the theme parameter
                theme = group_title
                summary = write_summary(focus, theme, "Professional", post_discussions)
                summaries.append(summary)
                print(f"Summary: {summary}")
                print(f"Summary generated successfully for group: {group_title}")
            else:
                print(f"WARNING: No discussions to summarize for group: {group_title}")
        
        print(f"\nTotal summaries generated: {len(summaries)}")
        
        return summaries

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Test the Reddit pipeline with a pipeline ID.')
    parser.add_argument('pipeline_id', type=str, help='The ID of the pipeline to use')
    
    import time
    start_time = time.time()
    args = parser.parse_args()
    test_pipeline(args.pipeline_id)
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")

if __name__ == '__main__':
    main()
