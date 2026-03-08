-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column to snippets table
alter table snippets 
add column if not exists embedding vector(1536);

-- Optional: Create an index for faster similarity search
create index on snippets using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
