SELECT polname, polcmd, polqual FROM pg_policy WHERE polrelid = 'public.project_anchors'::regclass;
