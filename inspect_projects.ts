
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ujcbsxmlbsffsmfozuhi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SkBz8Meos4P5zFSCnqA6zg_--IfdopY';

// Note: Using anon key for select/delete. This usually requires RLS policies to allow anon delete, 
// or I need the service role key. The .env.local only has anon key.
// If anon key fails for delete, I will ask user for service role key or use SQL via dashboard.
// But for now, let's try reading with anon key.

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log("--- project_anchors ---");
    const { data: anchors, error: e1 } = await supabase.from('project_anchors').select('*');
    if (e1) console.error("Error reading project_anchors:", e1.message);
    else console.table(anchors.map(a => ({ id: a.id, name: a.name })));

    console.log("\n--- projects (legacy) ---");
    const { data: projects, error: e2 } = await supabase.from('projects').select('*');
    if (e2) console.error("Error reading projects:", e2.message);
    else console.table(projects.map(p => ({ id: p.id, name: p.name })));
}

async function clean() {
    console.log("\n--- DELETING INTERN / INTERNSHIP PREP ---");

    // Deleting from project_anchors
    // User wants to keep "finance exam review" ONLY.
    // I will delete where name ILIKE '%intern%' 

    const { error: delError1 } = await supabase
        .from('project_anchors')
        .delete()
        .ilike('name', '%intern%');

    if (delError1) console.error("Delete 1 failed:", delError1.message);
    else console.log("Deleted matching rows from project_anchors");

    // Deleting from projects (legacy)
    const { error: delError2 } = await supabase
        .from('projects')
        .delete()
        .ilike('name', '%intern%');

    if (delError2) console.error("Delete 2 failed:", delError2.message);
    else console.log("Deleted matching rows from projects");

    // Check again
    await inspect();
}

// Run inspect first, then clean
clean();
