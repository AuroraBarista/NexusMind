-- Create a table for dynamic project anchors
create table if not exists project_anchors (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  color text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Seed with initial default anchors so the app doesn't break
insert into project_anchors (name, color, description) values
('academic', '#3B82F6', 'CS, Math, Research and Study'),
('internship', '#10B981', 'Career, Resume, Jobs'),
('social', '#EF4444', 'Lifestyle, Travel, Hobbies')
on conflict (name) do nothing;

-- Enable RLS (Optional, but good practice)
alter table project_anchors enable row level security;

create policy "Enable read access for all users"
on project_anchors for select
using (true);

create policy "Enable insert access for all users"
on project_anchors for insert
with check (true);
