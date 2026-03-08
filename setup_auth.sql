-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Handle automatic profile creation on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Secure the snippets table (Data Isolation)
alter table snippets add column if not exists user_id uuid references auth.users default auth.uid();

alter table snippets enable row level security;

-- Remove old policies to avoid conflicts if they exist
drop policy if exists "Users can only see their own snippets." on snippets;
drop policy if exists "Users can insert their own snippets." on snippets;
drop policy if exists "Users can update their own snippets." on snippets;
drop policy if exists "Users can delete their own snippets." on snippets;

create policy "Users can only see their own snippets." on snippets
  for select using (auth.uid() = user_id);

create policy "Users can insert their own snippets." on snippets
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own snippets." on snippets
  for update using (auth.uid() = user_id);

create policy "Users can delete their own snippets." on snippets
  for delete using (auth.uid() = user_id);
