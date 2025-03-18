create table public.pipeline_configs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  pipeline_id text not null,
  pipeline_name text not null,
  focus text not null,
  schedule text not null default 'daily'::text,
  delivery_time time without time zone not null default '09:00:00'::time without time zone,
  is_active boolean null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  last_delivered timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  delivery_email text[] null default '{}'::text[],
  last_delivered_date date null,
  subreddits text[] null,
  source text[] null,
  delivery_count bigint not null default '0'::bigint,
  last_delivered_time time with time zone null,
  constraint pipeline_configs_pkey primary key (id),
  constraint pipeline_configs_id_key unique (id),
  constraint pipeline_configs_user_id_pipeline_id_key unique (user_id, pipeline_id),
  constraint delivery_time_range check (
    (
      (
        delivery_time >= '00:00:00'::time without time zone
      )
      and (
        delivery_time <= '23:59:59'::time without time zone
      )
    )
  ),
  constraint max_three_emails check ((array_length(delivery_email, 1) <= 3))
) TABLESPACE pg_default;

create index IF not exists pipeline_configs_user_id_idx on public.pipeline_configs using btree (user_id) TABLESPACE pg_default;

create trigger update_pipeline_configs_updated_at BEFORE
update on pipeline_configs for EACH row
execute FUNCTION update_updated_at_column ();

create trigger update_pipeline_count_trigger
after INSERT
or DELETE
or
update OF user_id on pipeline_configs for EACH row
execute FUNCTION update_pipeline_count ();