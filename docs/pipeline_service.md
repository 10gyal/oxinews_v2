# Triggers
1. Webhook GET Request with `pipeline_id` as query parameter
    - This is for when a user creates a new pipeline
    - When a user completes creating a new pipeline, the configuration for the pipeline is saved to the supabase db table `pipeline_configs`
    - This GET request must check for a row in the `pipelin_configs` table where the `pipeline_id` matches and `delivery_count == 0` indicating that the pipeline has never been run before
    - After retreiving the row from the `pipeline_configs` table, execute the `run_pipeline` using the row data.

2. Cron Job polling every minute
    - This is to run users' pipeline and deliver the results at their specified schedules.
    - Since a pipeline takes some time to run, it is important to start running the pipelines 30 minutes before their `delivery_time`
    - Note that users can set their schedules to be 'daily', 'weekly' or 'monthly'. In order to track these, there is a column in the db table `pipline_configs` called `last_delivered_time` which shows date and time for the latest delivery. Use it appropriately so that the pipeline is run only 30 mintues before the `delivery_time`
    - After retreiving the correct rows from the `pipeline_configs` table, execute the `run_pipeline` using the row data.

A row in `pipeline_configs` table:
```json
{
  "data": {
    "created_at": "2025-03-13T14:39:58.557361+00:00",
    "delivery_count": 0,
    "delivery_email": [
      "tashi@rezi.io"
    ],
    "delivery_time": "09:00:00",
    "focus": "Latest in Blockchian tech. Avoid market speculation",
    "id": "fbf6fa74-0b3b-40d7-ab76-df491482e301",
    "is_active": true,
    "last_delivered": "2025-03-13T14:39:58.557361+00:00",
    "last_delivered_date": null,
    "last_delivered_time": null,
    "pipeline_id": "blockchain-tech-796342",
    "pipeline_name": "Blockchain Tech",
    "schedule": "daily",
    "source": [],
    "subreddits": [
      "BlockchianDevs, blockchainstartups"
    ],
    "updated_at": "2025-03-13T14:39:58.557361+00:00",
    "user_id": "8c4468c2-6185-4438-8de8-c4c8fdec69da"
  },
  "success": true
}
```

# run_pipeline
### 1. Reddit Retrieval
1. Using the `subreddits` retrieve all the **top posts** over the `schedule` (daily, weekly, monthly).
2. For each post, need the following fields:
    ```json
    {
    "subreddit": "microsaas",
    "score": 52,
    "subreddit_id": "t5_3n8ao",
    "num_comments": 3,
    "permalink": "/r/microsaas/comments/1jb1eez/i_spent_45_minutes_with_a_founder_who_scaled_his/",
    "created_utc": 1741950674,
    "post_id": "post id such as t3_1jb1eez",
    "post_content": "{title + '\n' + selftext}"
    }
    ```
3. Allow the posts to be filtered by `num_comments` but by default let it by 5
4. Pass the `post_id` and `post_content` to the Post Selector

### 2. Post Selector
1. This is an AI agent that uses that takes in a list of objects containing two fields - `post_id` and `post_content`
2. It returns a list of objects containing two fields - `title` and `related_post_ids`
3. 







