-- Phase 7 Migration: Project Pipeline Architecture

-- 1. Add 'contribution' column to project_evidence
ALTER TABLE public.project_evidence 
ADD COLUMN IF NOT EXISTS contribution TEXT;

-- 2. Add new JSONB columns to project_anchors for Pipeline storage
ALTER TABLE public.project_anchors
ADD COLUMN IF NOT EXISTS next_action_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS project_brief JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS strategic_pillars JSONB DEFAULT '[]'::jsonb;

-- Note: The `health_score` column is already JSONB from previous phases, 
-- we will just change the internal JSON structure we write to it via the API.
