-- Create the 'uploads' bucket if it doesn't verify
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Enable Request Level Security (RLS) is automatic for storage usually, 
-- but we define policies on storage.objects

-- Drop existing policies to avoid "already exists" error
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Insert" on storage.objects;
drop policy if exists "Public Update" on storage.objects;

-- Allow public read access to the 'uploads' bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- Allow public insert access to the 'uploads' bucket (for demo purposes)
create policy "Public Insert"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' );

-- Allow public update/delete if needed (optional)
create policy "Public Update"
  on storage.objects for update
  using ( bucket_id = 'uploads' );
