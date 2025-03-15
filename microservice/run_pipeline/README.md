# Run Pipeline Microservice

This microservice is responsible for executing content pipelines based on user configurations. It handles both webhook triggers for new pipelines and scheduled executions for recurring pipelines.

## Features

- Run pipelines by pipeline_id
- Run new pipelines (delivery_count = 0)
- Scheduled pipeline execution based on delivery time
- Health check endpoint

## Architecture

The microservice follows a modular architecture with the following components:

1. **Flask Application (app.py)**: Main entry point with API endpoints
2. **Pipeline Executor (pipeline_executor.py)**: Orchestrates the pipeline execution process
3. **Reddit Retrieval (reddit_retrieval.py)**: Retrieves posts from Reddit
4. **Get Comments (get_comments.py)**: Retrieves comments for selected posts
5. **Database Utilities (db_utils.py)**: Handles database operations
6. **Time Utilities (time_utils.py)**: Handles time and schedule-related operations
7. **Configuration (config.py)**: Stores configuration settings

## API Endpoints

- **GET /health**: Health check endpoint
- **GET /run?pipeline_id={pipeline_id}**: Run a pipeline by pipeline_id
- **GET /run_new?pipeline_id={pipeline_id}**: Run a new pipeline (delivery_count = 0) by pipeline_id
- **GET /schedule_check**: Check for scheduled pipelines and run them

## Pipeline Execution Flow

1. Retrieve Reddit posts based on subreddits and schedule
2. Select relevant posts using the post_selector agent
3. Retrieve comments for selected posts
4. Generate content using the writer agent
5. Save content to the database and update pipeline delivery stats

## Setup and Installation

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - REDDIT_CLIENT_ID
   - REDDIT_CLIENT_SECRET
   - REDDIT_USER_AGENT (optional)
   - DEBUG (optional)
   - PORT (optional)

3. Run the application:
   ```
   python app.py
   ```

## Scheduler

The application includes a background scheduler that runs every minute to check for pipelines that need to be executed based on their schedule and delivery time. The scheduler is automatically started when the application starts.

## Error Handling

The application includes comprehensive error handling and logging to help diagnose issues. Errors are logged with appropriate context and returned in the API responses.

## Dependencies

- Flask: Web framework
- APScheduler: Background scheduler
- Supabase: Database client
- Requests: HTTP client
- Python-dotenv: Environment variable management
- Python-dateutil: Date utilities
