require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'password123'
  });
  
  if (authError) {
      console.error("Auth error:", authError.message);
      return;
  }

  const { data, error } = await supabase
    .from('snippets')
    .insert([
        { content: 'Looking into React Server Components', user_id: session.user.id },
        { content: 'Next.js 15 routing changes are huge', user_id: session.user.id },
        { content: 'Need to research vector databases for AI', user_id: session.user.id },
        { content: 'Supabase pgvector extension tutorial', user_id: session.user.id },
        { content: 'Found a great article on embedding models comparison', user_id: session.user.id }
    ]);

  console.log('Result:', error ? error.message : "Inserted 5 rows successfully");
}
test();
