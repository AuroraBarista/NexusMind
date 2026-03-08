-- Create a table for snippets
create table snippets (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  type text default 'text',
  project_anchor text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
-- For now, we'll allow public insert/read for demonstration if you want, 
-- or you can restrict it. By default, enable RLS.
alter table snippets enable row level security;

-- Policy to allow anonymous inserts (if you want public access for now)
create policy "Allow anonymous inserts"
  on snippets for insert
  with check (true);

-- Policy to allow anonymous reads
create policy "Allow anonymous select"
  on snippets for select
  using (true);
