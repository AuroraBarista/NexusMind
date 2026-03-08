-- PART 1: Update Table Columns (Safe to run multiple times)
alter table snippets 
add column if not exists file_url text,
add column if not exists summary text,
add column if not exists ai_tags jsonb default '[]'::jsonb,
add column if not exists is_processed boolean default false;

-- PART 2: Create Storage Bucket 'uploads'
-- We use DO block to handle specific logic safely
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('uploads', 'uploads', true)
  on conflict (id) do nothing; -- Skip if already exists
end $$;

-- PART 3: Storage Access Policies (Drop existing to avoid duplication errors)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'uploads' );

drop policy if exists "Public Upload" on storage.objects;
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'uploads' );
