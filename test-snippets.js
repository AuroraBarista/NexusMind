require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from('snippets')
    .select('id, content, project_anchor');

  console.log('Result:', error ? error.message : JSON.stringify(data, null, 2));
}
test();
