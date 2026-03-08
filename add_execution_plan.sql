
-- Add execution_plan column if it doesn't exist
ALTER TABLE project_anchors 
ADD COLUMN IF NOT EXISTS execution_plan JSONB;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'project_anchors' AND column_name = 'execution_plan';
