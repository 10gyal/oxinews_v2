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
### 1. reddit_retrieval.py
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
4. Pass the results to the `post_selector.py`

### 2. post_selector.py
1. A list of results from the previous step is taken as input.
2. This is an AI agent that takes in a list of objects containing two fields - `post_id` and `post_content`
3. It returns a list of objects containing two fields - `title` and `related_post_ids`
4. As post processing, return a list of objects containing - `title` and `content` (use the `post_id` to get the details from step 1)

### 3. get_comments.py
1. Send a GET request to `https://flask-production-6529.up.railway.app/reddit` along with two header parameters - `subreddit` and `postid` (for which the value is `post_id` from the previous step). Additionally add a query parameter called `max_comment_depth` which is to 5 by default
2. The output must be `{"text": "response data from the get request", "permalink": "https://www.reddit.com" + ('reddit_retrieval').permalink"}`. This output object is sent to `writer.py`.

### 4. writer.py
1. This is an AI agent that takes in the output from step 3
2. This returns a list of objects such as:
    ```json
    {
    "title": "The Emergence of AI-Powered SaaS Tools for Niche Markets",
    "summary": "Recent discussions emphasize the growth of AI-powered SaaS tools, particularly those targeted at niche markets. Users on Reddit shared innovative ideas that highlight a demand for more specialized applications, such as AI-driven resume revision platforms, meeting summarizers, and integrated CRM solutions. These conversations reflect a trend towards leveraging AI for enhanced functionality in SaaS solutions, with many participants expressing excitement about the potential and offering constructive feedback on existing tools.",
    "sources": [
        {
            "subreddit": "r/SaaS",
            "postId": "1jb5v4f",
            "postTitle": "Drop your SaaS idea and I'll build it for you for free",
            "url": "https://www.reddit.com/r/SaaS/comments/1jb5v4f/drop_your_saas_idea_and_ill_build_it_for_you_for/",
            "commentCount": 123,
            "upvotes": 8
        },
        {
            "subreddit": "r/indiehackers",
            "postId": "1jbd7u2",
            "postTitle": "Do all AI coding tools suck at backend stuff?",
            "url": "https://www.reddit.com/r/indiehackers/comments/1jbd7u2/do_all_ai_coding_tools_suck_at_backend_stuff/",
            "commentCount": 6,
            "upvotes": 2
        }
    ],
    "keyPoints": [
        {
        "point": "There is a growing demand for specialized SaaS solutions powered by AI, as users suggest various innovative applications such as automated meeting summarizers and all-in-one CRM tools.",
        "sentiment": "positive",
        "subreddits": [
            "r/SaaS",
            "r/indiehackers"
            ]
        },
    ],
    "relevantLinks": [
        {
        "title": 
        "altan.ai - AI App Builder",
        "url": "http://altan.ai",
        "mentions": 5
        },
        {
        "title": "Solver AI - Backend focused AI coding tool",
        "url": "https://solverai.com",
        "mentions": 3
        }
    ],
    "overallSentiment": "positive",
    "article_url": "the-emergence-of-ai-powered-saas-tools-for-niche-markets"
    }
    ```

### 5. Update supabase db table
- Refer to `pipeline_reads.sql` to understand the table schema.
- The output generated from step 4 will the value to the column `content`.
- Using the `issue` field in the return object from step 1, calculate the value for the `issue` column
- Update the columns in `pipline_configs.sql` such as `last_delivered_time` and `delivery_count`