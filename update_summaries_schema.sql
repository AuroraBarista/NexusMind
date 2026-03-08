-- Add project_anchor to summaries table
alter table summaries add column if not exists project_anchor text;

-- Update RLS (optional, usually summaries should be private to user anyway)
-- Assuming user_id is already present
alter table summaries enable row level security;

drop policy if exists "Users can only see their own summaries." on summaries;
create policy "Users can only see their own summaries." on summaries
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own summaries." on summaries;
create policy "Users can insert their own summaries." on summaries
  for insert with check (auth.uid() = user_id);
