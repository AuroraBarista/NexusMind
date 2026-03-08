-- Phase 12 Data Privacy & Multi-Tenant Isolation
-- Goal: Ensure every project and evidence item is strictly isolated to its owner.

-- 1. Add user_id column to project_anchors and project_evidence
ALTER TABLE public.project_anchors
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.project_evidence
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Data Migration: Assign existing unowned projects/evidence to Patrick's primary account to avoid data loss.
-- We'll find the first registered user (which should be Patrick in this dev environment) and assign the data.
DO $$ 
DECLARE
    primary_user_id UUID;
BEGIN
    -- Get the earliest created user
    SELECT id INTO primary_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF primary_user_id IS NOT NULL THEN
        -- Update project_anchors
        UPDATE public.project_anchors SET user_id = primary_user_id WHERE user_id IS NULL;
        -- Update project_evidence
        UPDATE public.project_evidence SET user_id = primary_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 3. Now that data is migrated, make user_id NOT NULL for future inserts to enforce strict ownership
ALTER TABLE public.project_anchors
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.project_evidence
ALTER COLUMN user_id SET NOT NULL;

-- 4. Enable Row Level Security (RLS) on both tables (if not already enabled)
ALTER TABLE public.project_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_evidence ENABLE ROW LEVEL SECURITY;

-- 5. Drop any existing insecure "allow all" policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_anchors;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.project_anchors;
DROP POLICY IF EXISTS "Enable update for all users" ON public.project_anchors;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.project_anchors;

DROP POLICY IF EXISTS "Allow anonymous operations on project_evidence" ON public.project_evidence;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_evidence;

-- 6. Create Strict Multi-Tenant Isolation Policies for project_anchors
CREATE POLICY "Users can only see their own projects" ON public.project_anchors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON public.project_anchors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.project_anchors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.project_anchors
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create Strict Multi-Tenant Isolation Policies for project_evidence
CREATE POLICY "Users can only see their own evidence" ON public.project_evidence
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own evidence" ON public.project_evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own evidence" ON public.project_evidence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own evidence" ON public.project_evidence
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure snippets cascade delete their associated project_evidence (should already be the case via Schema)
-- Ensure project_anchors cascade delete their associated project_evidence (should already be the case via Schema)
