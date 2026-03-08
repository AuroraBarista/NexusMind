-- Fix RLS Data Leak: Purge ALL existing policies and recreate strict isolation.

ALTER TABLE public.project_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_evidence ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol record;
BEGIN
    -- 1. Loop through and DROP EVERY policy on project_anchors
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_anchors' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.project_anchors';
    END LOOP;

    -- 2. Loop through and DROP EVERY policy on project_evidence
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'project_evidence' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.project_evidence';
    END LOOP;
END
$$;

-- 3. Recreate the 8 Strict Multi-Tenant Isolation Policies

-- Policies for project_anchors
CREATE POLICY "isolated_select_projects" ON public.project_anchors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "isolated_insert_projects" ON public.project_anchors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "isolated_update_projects" ON public.project_anchors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "isolated_delete_projects" ON public.project_anchors
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for project_evidence
CREATE POLICY "isolated_select_evidence" ON public.project_evidence
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "isolated_insert_evidence" ON public.project_evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "isolated_update_evidence" ON public.project_evidence
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "isolated_delete_evidence" ON public.project_evidence
  FOR DELETE USING (auth.uid() = user_id);
