"""
Configuration settings for the run_pipeline microservice.
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

# Reddit API configuration
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USER_AGENT = os.getenv('REDDIT_USER_AGENT', 'OxiNews Pipeline Service')

# Comments API configuration
COMMENTS_API_URL = 'https://flask-production-6529.up.railway.app/reddit'
DEFAULT_MAX_COMMENT_DEPTH = 5

# Pipeline configuration
DEFAULT_COMMENT_THRESHOLD = 5
PIPELINE_LEAD_TIME_MINUTES = 30  # Run pipeline 30 minutes before delivery time

# Flask configuration
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
PORT = int(os.getenv('PORT', 5000))
