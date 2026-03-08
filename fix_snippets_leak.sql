-- Fix RLS Data Leak for Captures: Purge ALL existing policies on snippets and summaries, then recreate strict isolation.

ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    pol record;
BEGIN
    -- 1. Loop through and DROP EVERY policy on snippets
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'snippets' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.snippets';
    END LOOP;

    -- 2. Loop through and DROP EVERY policy on summaries
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'summaries' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.summaries';
    END LOOP;
END
$$;

-- 3. Data Migration Fallback: Ensure all unowned snippets and summaries belong to the primary admin account
DO $$ 
DECLARE
    primary_user_id UUID;
BEGIN
    SELECT id INTO primary_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF primary_user_id IS NOT NULL THEN
        UPDATE public.snippets SET user_id = primary_user_id WHERE user_id IS NULL;
        UPDATE public.summaries SET user_id = primary_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- 4. Recreate Strict Multi-Tenant Isolation Policies for snippets
CREATE POLICY "isolated_select_snippets" ON public.snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "isolated_insert_snippets" ON public.snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "isolated_update_snippets" ON public.snippets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "isolated_delete_snippets" ON public.snippets
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Recreate Strict Multi-Tenant Isolation Policies for summaries
CREATE POLICY "isolated_select_summaries" ON public.summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "isolated_insert_summaries" ON public.summaries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "isolated_update_summaries" ON public.summaries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "isolated_delete_summaries" ON public.summaries
  FOR DELETE USING (auth.uid() = user_id);
