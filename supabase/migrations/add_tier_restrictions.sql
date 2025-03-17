-- Add pipeline_count to users table
alter table auth.users
add column pipeline_count integer default 0;

-- Create a function to update pipeline_count
create or replace function public.update_pipeline_count()
returns trigger as $$
begin
  update auth.users
  set pipeline_count = (
    select count(*)
    from public.pipeline_configs
    where user_id = NEW.user_id
  )
  where id = NEW.user_id;
  return NEW;
end;
$$ language plpgsql;

-- Create trigger to maintain pipeline_count
create trigger update_pipeline_count_trigger
after insert or delete on public.pipeline_configs
for each row
execute function public.update_pipeline_count();

-- Policy for pipeline creation
create policy "Enforce free tier pipeline limit"
on public.pipeline_configs
for insert
to authenticated
with check (
  (select is_pro from auth.users where id = auth.uid())
  or
  (select pipeline_count from auth.users where id = auth.uid()) < 1
);

-- Policy for content sources
create policy "Enforce free tier source limit"
on public.pipeline_configs
for insert
to authenticated
with check (
  (select is_pro from auth.users where id = auth.uid())
  or
  (
    (array_length(subreddits, 1) is null or array_length(subreddits, 1) <= 10) 
    and 
    (array_length(source, 1) is null or array_length(source, 1) <= 10)
  )
);
