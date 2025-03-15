"""
Pipeline executor module for orchestrating the pipeline execution.
"""
import logging
import sys
import os
import json
from datetime import datetime

# Add the parent directory to sys.path to import the agents
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import pipeline modules
from run_pipeline.reddit_retrieval import retrieve_reddit_posts
from run_pipeline.get_comments import get_comments_for_posts
from run_pipeline.reddit_pipeline.agents.post_selector import select_posts
from run_pipeline.reddit_pipeline.agents.writer import generate_content
import db_utils
import time_utils
import config

def execute_pipeline(pipeline_config):
    """
    Execute the pipeline with the given configuration.
    
    Args:
        pipeline_config (dict): Pipeline configuration
        
    Returns:
        dict: Result of the pipeline execution
    """
    try:
        logging.info(f"Starting pipeline execution for {pipeline_config.get('pipeline_id')}")
        
        # Extract pipeline parameters
        pipeline_id = pipeline_config.get('pipeline_id')
        pipeline_name = pipeline_config.get('pipeline_name')
        subreddits = pipeline_config.get('subreddits', [])
        schedule = pipeline_config.get('schedule', 'daily')
        focus = pipeline_config.get('focus', '')
        user_id = pipeline_config.get('user_id')
        delivery_count = pipeline_config.get('delivery_count', 0)
        
        # Step 1: Retrieve Reddit posts
        logging.info(f"Step 1: Retrieving Reddit posts for {pipeline_id}")
        posts = retrieve_reddit_posts(
            subreddits=subreddits,
            schedule=schedule,
            comment_threshold=config.DEFAULT_COMMENT_THRESHOLD
        )
        
        if not posts:
            logging.warning(f"No posts retrieved for pipeline {pipeline_id}")
            return {
                'success': False,
                'error': 'No posts retrieved'
            }
        
        logging.info(f"Retrieved {len(posts)} posts for pipeline {pipeline_id}")
        
        # Step 2: Select posts using AI agent
        logging.info(f"Step 2: Selecting posts for pipeline {pipeline_id}")
        post_data = [{'post_id': post['post_id'], 'post_content': post['post_content']} for post in posts]
        selected_posts = select_posts(post_data, focus)
        
        if not selected_posts:
            logging.warning(f"No posts selected for pipeline {pipeline_id}")
            return {
                'success': False,
                'error': 'No posts selected'
            }
        
        logging.info(f"Selected {len(selected_posts)} post groups for pipeline {pipeline_id}")
        
        # Step 3: Get comments for selected posts
        logging.info(f"Step 3: Getting comments for pipeline {pipeline_id}")
        posts_with_comments = get_comments_for_posts(
            selected_posts=selected_posts,
            post_data=posts,
            max_comment_depth=config.DEFAULT_MAX_COMMENT_DEPTH
        )
        
        if not posts_with_comments:
            logging.warning(f"No comments retrieved for pipeline {pipeline_id}")
            return {
                'success': False,
                'error': 'No comments retrieved'
            }
        
        # Step 4: Generate content using writer agent
        logging.info(f"Step 4: Generating content for pipeline {pipeline_id}")
        content = generate_content(posts_with_comments, focus)
        
        if not content:
            logging.warning(f"No content generated for pipeline {pipeline_id}")
            return {
                'success': False,
                'error': 'No content generated'
            }
        
        # Step 5: Update database
        logging.info(f"Step 5: Updating database for pipeline {pipeline_id}")
        
        # Save content to pipeline_reads table
        content_saved = db_utils.save_pipeline_content(
            pipeline_id=pipeline_id,
            pipeline_name=pipeline_name,
            title=content[0].get('title', f"{pipeline_name} - Issue {delivery_count + 1}"),
            content=content,
            user_id=user_id
        )
        
        if not content_saved:
            logging.error(f"Failed to save content for pipeline {pipeline_id}")
            return {
                'success': False,
                'error': 'Failed to save content'
            }
        
        # Update pipeline delivery stats
        current_time = time_utils.get_current_utc_timestamp()
        stats_updated = db_utils.update_pipeline_delivery_stats(
            pipeline_id=pipeline_id,
            delivery_count=delivery_count + 1,
            last_delivered=current_time
        )
        
        if not stats_updated:
            logging.error(f"Failed to update delivery stats for pipeline {pipeline_id}")
            return {
                'success': False,
                'error': 'Failed to update delivery stats'
            }
        
        logging.info(f"Pipeline {pipeline_id} executed successfully")
        
        return {
            'success': True,
            'pipeline_id': pipeline_id,
            'content': content
        }
    except Exception as e:
        logging.error(f"Error executing pipeline {pipeline_config.get('pipeline_id')}: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def run_scheduled_pipelines():
    """
    Run pipelines that are scheduled to run.
    
    Returns:
        dict: Results of pipeline executions
    """
    try:
        logging.info("Checking for scheduled pipelines")
        
        # Get all active pipelines
        pipelines = db_utils.get_scheduled_pipelines()
        
        if not pipelines:
            logging.info("No active pipelines found")
            return {
                'success': True,
                'message': 'No active pipelines found'
            }
        
        results = []
        
        # Check each pipeline to see if it should run
        for pipeline in pipelines:
            try:
                pipeline_id = pipeline.get('pipeline_id')
                schedule = pipeline.get('schedule')
                delivery_time = pipeline.get('delivery_time')
                last_delivered = pipeline.get('last_delivered')
                
                # Check if pipeline should run
                if time_utils.should_run_pipeline(
                    schedule=schedule,
                    delivery_time=delivery_time,
                    last_delivered=last_delivered,
                    lead_time_minutes=config.PIPELINE_LEAD_TIME_MINUTES
                ):
                    logging.info(f"Running scheduled pipeline {pipeline_id}")
                    result = execute_pipeline(pipeline)
                    results.append({
                        'pipeline_id': pipeline_id,
                        'result': result
                    })
            except Exception as e:
                logging.error(f"Error checking pipeline {pipeline.get('pipeline_id')}: {str(e)}")
                results.append({
                    'pipeline_id': pipeline.get('pipeline_id'),
                    'error': str(e)
                })
        
        return {
            'success': True,
            'results': results
        }
    except Exception as e:
        logging.error(f"Error running scheduled pipelines: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
