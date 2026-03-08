-- Add context fields to project_anchors table
ALTER TABLE project_anchors 
ADD COLUMN IF NOT EXISTS goal_description TEXT,
ADD COLUMN IF NOT EXISTS requirements_doc JSONB;
