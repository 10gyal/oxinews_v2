# Logic

1. trigger.py
GET endpoint that retrieves a row for the given `pipeline_id` where `delivery_count` is 0.
    
    Query Parameters:
    - pipeline_id: The ID of the pipeline to retrieve
    
    Returns:
    - JSON response with the pipeline data or an error message
    
    ```json
    {
    "data": {
        "created_at": "2025-03-09T07:54:23.668957+00:00",
        "delivery_count": 0,
        "delivery_email": null,
        "delivery_time": "09:00:00",
        "focus": "Emerging Trends in Blockchain Technology. Avoid market speculation",
        "id": "8e16d596-1d5b-472c-9528-1e8885e7cf21",
        "is_active": true,
        "last_delivered": "2025-03-09T07:54:23.668957+00:00",
        "last_delivered_date": null,
        "last_delivered_time": null,
        "pipeline_id": "blockchain-tech-863523",
        "pipeline_name": "Blockchain Tech",
        "schedule": "daily",
        "source": null,
        "subreddits": [
        "BlockchainDev",
        "BlockchainStartups"
        ],
        "updated_at": "2025-03-09T07:54:23.668957+00:00",
        "user_id": "7385cc5b-4954-4aa9-bc62-45904a9b7e74"
    },
    "success": true
    }
    ```

2. /reddit
Takes each of the subreddit from the `subreddits` from the trigger response and retrieves all the the following:
```json
{
    "subreddit": {
        "type": "string",
        "description": "subreddit name"
    },
    "subreddit_id": {
        "type": "string"
    },
    "post_id": {
        "type": "string"
    },
    "score": {
        "type": "string"
    },
    
    "num_comments": {
        "type": "integer"
    },
    "permalink": {
        "type": "string"
    },
    "created_utc": {
        "type": "string"
    },
    "post_content": {
        "type": "string",
        "description": "post title + '\n' + selftext"
    }
}
```


