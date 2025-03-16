"""
Direct test script for the post_selector module without using Flask.
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
from reddit_pipeline.agents.post_selector import select_posts
from reddit_pipeline.agents.theme_selector import aggregate_posts
import db_utils
import config

def test_post_selector(pipeline_id):
    """
    Test the post_selector with a given pipeline_id.
    
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
        print("\nRetrieving Reddit posts...")
        posts = retrieve_reddit_posts(
            subreddits=subreddits,
            schedule=schedule,
            comment_threshold=config.DEFAULT_COMMENT_THRESHOLD
        )
        
        if not posts:
            print("Error: No posts retrieved")
            return
        
        print(f"Retrieved {len(posts)} posts")
        
        # Step 2: Process posts for post_selector
        post_data = [{'post_id': post['post_id'], 'post_content': post['post_content']} for post in posts]
        
        # Step 3: Run post_selector
        print("\nRunning post_selector...")
        selected_posts = select_posts(post_data, focus)
        
        # Step 4: Print results
        print("\n===== POST SELECTOR RESULTS =====")
        print(f"Selected group count: {len(selected_posts)}")
        
        for i, group in enumerate(selected_posts, 1):
            print(f"\nGROUP {i}: {getattr(group, 'title')}")
            print(f"Post IDs: {', '.join(getattr(group, 'related_post_ids'))}")
            print("Posts:")
            for post_id in getattr(group, 'related_post_ids'):
                content = next((p['post_content'] for p in post_data if p['post_id'] == post_id), "Content not found")
                print(f"\n  - Post ID: {post_id}")
                print(f"    Content: {content[:100]}...")
        
    except Exception as e:
        print(f"Error: {str(e)}")


def test_theme_selector(pipeline_id):
    """
    Test the theme_selector with a given pipeline_id.
    
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

        # Step 1: Retrieve Reddit posts for the theme selector
        print("\nRetrieving Reddit posts...")
        posts = retrieve_reddit_posts(
            subreddits=subreddits,
            schedule=schedule,
            comment_threshold=config.DEFAULT_COMMENT_THRESHOLD
        )

        print("Number of posts retrieved: ", len(posts))

        # Step 2: Process posts for theme_selector
        post_data = [{'post_id': post['post_id'], 'post_content': post['post_content']} for post in posts]
        
        # Step 3: Run theme selector with aggregate_posts
        print("\nRunning theme selector...")
        result = aggregate_posts(post_data, focus)

        print(result)

    except Exception as e:
        print(f"Error: {str(e)}")

def main():
    """
    Main function.
    """
    parser = argparse.ArgumentParser(description='Test the post_selector and theme_selector modules with a pipeline ID.')
    parser.add_argument('pipeline_id', type=str, help='The ID of the pipeline to use')
    parser.add_argument('--test-type', type=str, choices=['theme', 'post', 'both'], default='theme',
                      help='Type of test to run: theme, post, or both (default: theme)')
    
    args = parser.parse_args()
    
    if args.test_type == 'post':
        test_post_selector(args.pipeline_id)
    elif args.test_type == 'theme':
        test_theme_selector(args.pipeline_id)
    else:  # both
        test_post_selector(args.pipeline_id)
        print("\n" + "="*50 + "\n")
        test_theme_selector(args.pipeline_id)
if __name__ == '__main__':
    main()
