-- Add missing columns to 'snippets' table
alter table snippets add column if not exists user_id uuid references auth.users default auth.uid();
alter table snippets add column if not exists file_url text;
alter table snippets add column if not exists status text default 'processing';
alter table snippets add column if not exists ai_tags text[];
alter table snippets add column if not exists summary text;
alter table snippets add column if not exists is_processed boolean default false;
alter table snippets add column if not exists embedding text; -- Or vector(1536) if pgvector is enabled

-- Ensure RLS is enabled
alter table snippets enable row level security;

-- Drop old loose policies
drop policy if exists "Allow anonymous inserts" on snippets;
drop policy if exists "Allow anonymous select" on snippets;
drop policy if exists "Users can only see their own snippets." on snippets;
drop policy if exists "Users can insert their own snippets." on snippets;
drop policy if exists "Users can update their own snippets." on snippets;
drop policy if exists "Users can delete their own snippets." on snippets;

-- Create secure policies
create policy "Users can only see their own snippets." on snippets
  for select using (auth.uid() = user_id);

create policy "Users can insert their own snippets." on snippets
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own snippets." on snippets
  for update using (auth.uid() = user_id);

create policy "Users can delete their own snippets." on snippets
  for delete using (auth.uid() = user_id);

-- Optional: Allow system-level processing (if using service role)
-- Service role bypasses RLS anyway.
