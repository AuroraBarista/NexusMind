require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log("Checking project_anchors schema via standard select...");
    const { data, error } = await supabase
        .from('project_anchors')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error.message);
    } else {
        if (data && data.length > 0) {
            console.log("Columns present in project_anchors:", Object.keys(data[0]).join(', '));
            if (!Object.keys(data[0]).includes('user_id')) {
                console.error("❌ 'user_id' column is MISSING! The phase 12 migration script did not execute successfully.");
            } else {
                console.log("✅ 'user_id' column is present.");
            }
        } else {
            console.log("No data returned (RLS might be blocking, or table empty).");
        }
    }
}

checkSchema();
