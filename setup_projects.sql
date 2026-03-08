-- Create the projects table
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text default 'cyan' not null,
  icon text default 'Folder' not null,
  is_active_focus boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Create policy to allow users to select their own projects
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);

-- Create policy to allow users to insert their own projects
create policy "Users can insert their own projects" on public.projects
  for insert with check (auth.uid() = user_id);

-- Create policy to allow users to update their own projects
create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);

-- Create policy to allow users to delete their own projects
create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Add project_id to snippets table (optional for now, but good for future linking)
-- alter table public.snippets add column project_id uuid references public.projects(id);
