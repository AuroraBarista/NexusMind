-- Add missing columns to the snippets table
alter table snippets 
add column if not exists status text default 'processed',
add column if not exists file_url text;

-- Allow public update if needed for status updates
create policy "Allow anonymous update"
  on snippets for update
  using (true);

-- Allow delete
create policy "Allow anonymous delete"
  on snippets for delete
  using (true);
