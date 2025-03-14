create table public.user_metadata (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  onboarding_completed boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_metadata_pkey primary key (id),
  constraint user_metadata_user_id_key unique (user_id),
  constraint user_metadata_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_user_metadata_updated_at BEFORE
update on user_metadata for EACH row
execute FUNCTION update_updated_at_column ();