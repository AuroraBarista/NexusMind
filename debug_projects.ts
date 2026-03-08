
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ujcbsxmlbsffsmfozuhi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SkBz8Meos4P5zFSCnqA6zg_--IfdopY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debug() {
    console.log("--- Fetching ALL project_anchors ---");
    const { data: anchors, error: e1 } = await supabase.from('project_anchors').select('*');
    if (e1) console.error("Error:", e1);
    else console.table(anchors);

    console.log("\n--- Fetching ALL projects ---");
    const { data: projects, error: e2 } = await supabase.from('projects').select('*');
    if (e2) console.error("Error:", e2);
    else console.table(projects);
}

debug();
