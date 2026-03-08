-- Phase 8 Data Structure Upgrades

-- 1. Add new AI-driven columns to project_evidence
ALTER TABLE project_evidence 
ADD COLUMN IF NOT EXISTS insight TEXT,
ADD COLUMN IF NOT EXISTS decision_impact TEXT;

-- 2. Add new JSONB column for the expanded next_action details
ALTER TABLE project_anchors
ADD COLUMN IF NOT EXISTS next_action_details JSONB;

-- (Note: 'momentum' will be stored inside the existing 'health_score' JSONB block. )
-- (Note: 'current_stage' will be managed via the existing 'roadmap' JSONB block or a new top-level field. Let's add a dedicated stage string for easier querying.)

ALTER TABLE project_anchors
ADD COLUMN IF NOT EXISTS current_stage VARCHAR(50) DEFAULT 'IDEA';

-- 3. We also need to ensure that querying evidence cross-project works. 
-- The project_evidence table already uses snippet_id, so counting references is a standard SQL COUNT query. No schema change needed there.
