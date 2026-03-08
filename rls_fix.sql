create policy "Enable insert access for all users" on snippets for insert with check (true);
alter table snippets enable row level security;
