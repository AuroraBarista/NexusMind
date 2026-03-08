require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY); // Using service role to bypass RLS for debugging if it existed

async function test() {
  const { data: captures, error } = await supabase
    .from('snippets')
    .select('id, user_id, content, project_anchor')
    .or('project_anchor.is.null,project_anchor.eq.""')
    .order('created_at', { ascending: false })
    .limit(30);

  console.log('Result:', error ? error.message : JSON.stringify(captures, null, 2));
}
test();
