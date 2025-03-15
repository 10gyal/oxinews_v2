"""
Test script for the post_selector module.
"""
from flask import Flask, request, jsonify
import json
import logging
import sys
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Add necessary paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

# Import required modules
from reddit_retrieval import retrieve_reddit_posts
from reddit_pipeline.agents.post_selector import select_posts
import db_utils
import config

# Print debug information
print(f"Current directory: {current_dir}")
print(f"Parent directory: {parent_dir}")
print(f"sys.path: {sys.path}")

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    """
    Root endpoint that provides basic instructions.
    
    Returns:
    - HTML response with instructions
    """
    return """
    <html>
        <head>
            <title>Post Selector Test</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #333; }
                code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>Post Selector Test Service</h1>
            <p>This service allows you to test the post_selector module with real data from a pipeline configuration.</p>
            <h2>How to Use</h2>
            <p>Make a GET request to the following endpoint:</p>
            <code>/test-selector?pipeline_id=your_pipeline_id</code>
            <p>Replace <code>your_pipeline_id</code> with the ID of an existing pipeline in your Supabase database.</p>
            <p>Example: <a href="/test-selector?pipeline_id=blockchain-tech-796342">/test-selector?pipeline_id=blockchain-tech-796342</a></p>
        </body>
    </html>
    """

@app.route('/test-selector', methods=['GET'])
def test_selector():
    """
    Test endpoint that runs the post_selector on Reddit posts for a given pipeline_id.
    
    Query Parameters:
    - pipeline_id: The ID of the pipeline to use
    
    Returns:
    - JSON response with the selected posts
    """
    pipeline_id = request.args.get('pipeline_id')
    
    if not pipeline_id:
        return jsonify({'error': 'Missing pipeline_id parameter'}), 400
    
    try:
        # Get pipeline configuration
        pipeline_config = db_utils.get_pipeline_config(pipeline_id)
        
        if not pipeline_config:
            return jsonify({'error': f'Pipeline not found: {pipeline_id}'}), 404
        
        # Extract relevant pipeline parameters
        subreddits = pipeline_config.get('subreddits', [])
        schedule = pipeline_config.get('schedule', 'daily')
        focus = pipeline_config.get('focus', '')
        
        # Step 1: Retrieve Reddit posts
        logging.info(f"Retrieving Reddit posts for {pipeline_id}")
        posts = retrieve_reddit_posts(
            subreddits=subreddits,
            schedule=schedule,
            comment_threshold=config.DEFAULT_COMMENT_THRESHOLD
        )
        
        if not posts:
            return jsonify({'error': 'No posts retrieved'}), 404
        
        logging.info(f"Retrieved {len(posts)} posts")
        
        # Step 2: Process posts for post_selector
        post_data = [{'post_id': post['post_id'], 'post_content': post['post_content']} for post in posts]
        
        # Step 3: Run post_selector
        logging.info("Running post_selector")
        selected_posts = select_posts(post_data, focus)
        
        # Step 4: Format and return the results
        result = {
            'pipeline_id': pipeline_id,
            'pipeline_name': pipeline_config.get('pipeline_name', ''),
            'focus': focus,
            'post_count': len(posts),
            'selected_groups': [
                {
                    'title': group.title,
                    'post_ids': group.related_post_ids,
                    'posts': [
                        {
                            'post_id': post_id,
                            'content': next((p['post_content'] for p in post_data if p['post_id'] == post_id), None)
                        } for post_id in group.related_post_ids
                    ]
                } for group in selected_posts.output
            ]
        }
        
        # Print detailed results to console
        print("\n===== POST SELECTOR RESULTS =====")
        print(f"Pipeline: {pipeline_config.get('pipeline_name', '')} ({pipeline_id})")
        print(f"Focus: {focus}")
        print(f"Total posts retrieved: {len(posts)}")
        print(f"Selected group count: {len(selected_posts.output)}")
        
        for i, group in enumerate(selected_posts.output, 1):
            print(f"\nGROUP {i}: {group.title}")
            print(f"Post IDs: {', '.join(group.related_post_ids)}")
            print("Posts:")
            for post_id in group.related_post_ids:
                content = next((p['post_content'] for p in post_data if p['post_id'] == post_id), "Content not found")
                print(f"\n  - Post ID: {post_id}")
                print(f"    Content: {content[:100]}...")
        
        return jsonify(result)
    
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
