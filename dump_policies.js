require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function dumpPolicies() {
    console.log("Fetching all RLS policies for project_anchors and project_evidence...");

    // We can query pg_policies if we query it via rpc or if it's exposed, but pg_policies is usually not exposed to the REST API.
    // Instead, let's just write a raw SQL execute script if Supabase has a way, else we'll ask the user to run it.
    // Wait, we can't query pg_policies via REST.
    console.log("Attempting REST query on pg_policies...");
    const { data, error } = await supabaseAdmin
        .from('pg_policies')
        .select('*')
        .in('tablename', ['project_anchors', 'project_evidence']);

    if (error) {
        console.error("Direct query failed (expected for sys tables):", error.message);
    } else {
        console.log("Policies:", JSON.stringify(data, null, 2));
    }
}

dumpPolicies();
