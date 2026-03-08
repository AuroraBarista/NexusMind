import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

async function run() {
  const projectId = '53b7fa64-8831-4515-8d75-224fc255ec83';

  // Get credentials from .env.local
  const dotEnvText = fs.readFileSync('.env.local', 'utf8');
  const supabaseUrl = dotEnvText.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
  const supabaseKey = dotEnvText.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || dotEnvText.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

  const supabase = createClient(supabaseUrl, supabaseKey);

  const snippets = [
    {
      content: "[WEB_CAPTURE] Competitor Analysis: Sunnyside & Reframe URL: https://example.com/competitor-analysis - Existing drinking tracking apps like Reframe and Sunnyside focus heavily on subscriptions and daily coaching. However, user reviews indicate a strong demand for a simple, zero-friction, beautiful UI for just logging drinks without the heavy psychological coaching. This defines our MVP gap.",
      type: "Research"
    },
    {
      content: "Conducted 10 user interviews with social drinkers who want to cut back. Key takeaway: 80% reported abandoning tracking apps because the input process takes too many taps. If we can implement a 'One-Tap iOS Widget' for logging, users stated they would stick with it. This validates our core feature hypothesis.",
      type: "Text"
    },
    {
      content: "We launched a test landing page demonstrating our 'Cyber-Minimalist' fast-tracking UI. Ran $50 in Facebook ads. Result: 240 signups to the waitlist at a extremely low $0.20 CAC. The value proposition 'Track drinks faster than texting, no judgment' resonates strongly with the target audience.",
      type: "Text"
    }
  ];

  for (const s of snippets) {
    console.log(`Inserting snippet...`);
    const { data, error } = await supabase.from('snippets').insert([s]).select();
    if (error) {
      console.error("Error inserting snippet", error);
      continue;
    }

    const snippetId = data[0].id;
    console.log(`Linking snippet ${snippetId} to project...`);

    try {
      const res = await fetch('http://localhost:3000/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, snippet_id: snippetId })
      });
      const linkData = await res.json();
      console.log(`Link result:`, linkData.success ? 'Success' : linkData.error);
    } catch (e) {
      console.error("Error calling /api/evidence", e);
    }
  }
}

run();
