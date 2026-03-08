-- Phase 3: Project Execution Engine Schema Updates

-- 1. Create project_evidence table
create table if not exists project_evidence (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references project_anchors(id) on delete cascade not null,
    snippet_id uuid references snippets(id) on delete cascade not null,
    type text not null check (type in ('Research', 'Idea', 'Technical', 'Market', 'Prototype', 'Other')),
    relevance_score integer default 0,
    summary text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(project_id, snippet_id)
);

-- Enable RLS for project_evidence
alter table project_evidence enable row level security;

-- Policy to allow anonymous/public access for demonstration (similar to snippets table currently)
create policy "Allow anonymous operations on project_evidence"
  on project_evidence for all
  using (true)
  with check (true);


-- 2. Modify project_anchors table to support the new Execution Engine layout
alter table project_anchors 
add column if not exists objective text,
add column if not exists target_audience text,
add column if not exists health_score jsonb default '{"idea_clarity": 0, "evidence_strength": 0, "execution_readiness": 0}'::jsonb,
add column if not exists roadmap jsonb default '[]'::jsonb,
add column if not exists next_action text,
add column if not exists progress integer default 0;
