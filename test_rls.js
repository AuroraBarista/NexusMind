require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function verifyRLS() {
    console.log("Starting Multi-Tenant RLS Verification...");

    const testEmail = `adminuser${Math.floor(Math.random() * 1000)}@test.com`;
    const testPassword = 'securepassword123';

    console.log(`\n1. Creating user via Admin API: ${testEmail}`);
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
    });

    if (adminError) {
        console.error("Failed to create user via admin:", adminError.message);
        process.exit(1);
    }

    console.log("Signing in using Anon API...");
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    });

    if (signInError) {
        console.error("Failed to sign in:", signInError.message);
        process.exit(1);
    }

    let success = true;

    console.log("\n2. Querying project_anchors as the new authenticated user...");
    const { data: projects, error: projectsError } = await supabaseAnon
        .from('project_anchors')
        .select('id, name');

    if (projectsError) console.error(projectsError);
    console.log(`Found ${projects?.length || 0} projects.`);
    if (projects?.length === 0) {
        console.log("✅ SUCCESS: The new user sees an isolated, empty projects workspace.");
    } else {
        console.log("❌ FAILED: The new user can see existing projects. RLS is not properly applied.");
        success = false;
    }

    console.log("\n3. Querying project_evidence as the new authenticated user...");
    const { data: evidence, error: evidenceError } = await supabaseAnon
        .from('project_evidence')
        .select('id');

    if (evidenceError) console.error(evidenceError);
    console.log(`Found ${evidence?.length || 0} evidence items.`);
    if (evidence?.length === 0) {
        console.log("✅ SUCCESS: The new user sees an isolated, empty evidence workspace.");
    } else {
        console.log("❌ FAILED: The new user can see existing evidence. RLS is not properly applied.");
        success = false;
    }

    process.exit(success ? 0 : 1);
}

verifyRLS();
