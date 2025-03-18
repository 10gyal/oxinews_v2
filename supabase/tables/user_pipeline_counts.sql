create table public.user_pipeline_counts (
  user_id uuid not null,
  pipeline_count integer not null default 0,
  constraint user_pipeline_counts_pkey primary key (user_id),
  constraint user_pipeline_counts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;