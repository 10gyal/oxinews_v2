# Test Post Selector Script

This script provides a simple way to test the post_selector module with real data from a pipeline configuration.

## Overview

The script creates a Flask web server with a single endpoint that:
1. Retrieves a pipeline configuration by ID
2. Fetches Reddit posts based on the pipeline's subreddits and schedule
3. Runs the post_selector on those posts
4. Prints detailed results to the console
5. Returns a JSON response with the selected posts

## Prerequisites

Ensure you have all the required dependencies installed:
```
pip install -r requirements.txt
```

Make sure your environment variables are properly set up in a `.env` file (see `.env.example`).

## Running the Script

Run the script with:
```
python test_post_selector.py
```

This will start a Flask server on port 5001.

## Testing the Post Selector

To test the post selector, make a GET request to:
```
http://localhost:5001/test-selector?pipeline_id=your_pipeline_id
```

Replace `your_pipeline_id` with the ID of an existing pipeline in your Supabase database.

You can use a web browser, curl, or any API testing tool like Postman to make the request.

### Example using curl:
```
curl "http://localhost:5001/test-selector?pipeline_id=blockchain-tech-796342"
```

## Output

The script provides two types of output:

1. **Console Output**: Detailed, human-readable information about the selected posts, including:
   - Pipeline information
   - Focus topic
   - Post counts
   - Each group with its title
   - Each post with ID and preview of content

2. **JSON Response**: A structured JSON response containing:
   - Pipeline details
   - Focus topic
   - Total post count
   - Selected groups with their titles and posts

## Troubleshooting

If you encounter any issues:

1. Check that your Supabase credentials are correct
2. Verify that the pipeline_id exists in your database
3. Ensure the Reddit API credentials are valid
4. Look at the console logs for detailed error messages
