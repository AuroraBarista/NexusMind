
-- Create Summaries Table
create table if not exists summaries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- Optional depending on auth setup, can be nullable for now if using anon
  period_type text check (period_type in ('daily', 'weekly', 'monthly')),
  period_start timestamptz not null,
  period_end timestamptz not null,
  summary_content jsonb not null, -- Stores the AI analysis
  created_at timestamptz default now()
);

-- Index for faster lookups by period
create index if not exists summaries_period_idx on summaries (period_type, period_start);
