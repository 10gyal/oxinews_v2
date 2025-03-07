-- Migration script to move data from popular_config to pipeline_configs
-- This script will:
-- 1. Select all records from popular_config
-- 2. Insert them into pipeline_configs with appropriate mappings
-- 3. Set default values for required fields that don't exist in popular_config

-- Begin transaction
BEGIN;

-- Insert data from popular_config to pipeline_configs
INSERT INTO public.pipeline_configs (
  id,                -- UUID, generated for each record
  user_id,           -- Required, set to 'system' as default
  pipeline_id,       -- Required, generated based on original ID
  name,              -- Required, use category or default if NULL
  focus,             -- Required, use focus or default if NULL
  schedule,          -- Required, default to 'daily'
  delivery_time,     -- Required, default to '09:00:00'
  is_active,         -- Required, default to true
  created_at,        -- Use original created_at
  updated_at,        -- Set to current timestamp
  last_delivered,    -- Required, default to current timestamp
  delivery_email,    -- Optional, set to empty array
  last_delivered_date, -- Optional, set to NULL
  subreddits,        -- Optional, map directly from popular_config
  source             -- Optional, map directly from popular_config
)
SELECT 
  gen_random_uuid() AS id,
  'system' AS user_id,
  'popular_' || id::text AS pipeline_id,
  COALESCE(category, 'Popular ' || id::text) AS name,
  COALESCE(focus, 'Content from popular sources') AS focus,
  'daily' AS schedule,
  '09:00:00'::time without time zone AS delivery_time,
  true AS is_active,
  created_at,
  timezone('utc'::text, now()) AS updated_at,
  timezone('utc'::text, now()) AS last_delivered,
  '{}'::text[] AS delivery_email,
  NULL AS last_delivered_date,
  subreddits,
  source
FROM 
  public.popular_config;

-- Commit transaction
COMMIT;

-- Output migration summary
SELECT 'Migration complete. ' || COUNT(*) || ' records migrated from popular_config to pipeline_configs.' AS migration_summary
FROM public.popular_config;
