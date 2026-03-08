require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'test@test.com',
    password: 'password123'
  });
  if (error) console.error(error.message);
  else console.log('User ID:', session.user.id);
}
test();
