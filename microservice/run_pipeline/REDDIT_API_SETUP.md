# Reddit API Setup Guide

This guide explains how to set up a Reddit API application for use with the run_pipeline microservice.

## Creating a Reddit API Application

1. Go to https://www.reddit.com/prefs/apps
2. Click the "create app" or "create another app" button at the bottom
3. Fill in the following details:
   - **name**: OxiNews Pipeline Service (or any name you prefer)
   - **app type**: Select "script"
   - **description**: A service that retrieves Reddit posts for content pipelines (optional)
   - **about url**: Your website URL (optional)
   - **redirect uri**: http://localhost:8000/reddit_callback
   - **permissions**: Read access is sufficient

4. Click "create app" button

## Getting Your API Credentials

After creating the application, you'll see:

1. **client_id**: This is displayed under your app name (it's a string of random characters)
2. **client_secret**: This is labeled as "secret"

## Setting Up Environment Variables

Add these credentials to your `.env` file:

```
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=script:oxinews-pipeline:v1.0 (by /u/your_username)
```

## Important Notes About User Agent

Reddit requires a properly formatted user agent string. The recommended format is:

```
platform:app_name:version (by /u/username)
```

For example:
```
script:oxinews-pipeline:v1.0 (by /u/your_username)
```

Using a generic user agent like "OxiNews Pipeline Service" might cause your requests to be blocked.

## Testing Your Credentials

After setting up your Reddit API credentials, you can test them using the test_reddit_auth.py script:

```
python test_reddit_auth.py
```

This script will:
1. Attempt to authenticate with the Reddit API using your credentials
2. Make a simple API call to verify that authentication works
3. Display detailed error messages if authentication fails
4. Provide troubleshooting tips

## Common Issues and Solutions

1. **403 Blocked Error**:
   - Use a properly formatted user agent string
   - Make sure your Reddit account is in good standing
   - Try creating a new Reddit API application

2. **401 Unauthorized Error**:
   - Double-check your client_id and client_secret
   - Make sure you're copying the credentials correctly

3. **Rate Limiting**:
   - Reddit limits API requests to 60 per minute
   - Implement proper rate limiting in your code

4. **Script Authentication**:
   - For some applications, you might need to use username/password authentication
   - Update the RedditAuth class to include your username and password if needed

## Additional Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Reddit OAuth2 Wiki](https://github.com/reddit-archive/reddit/wiki/OAuth2)
