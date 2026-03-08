import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { project_id, user_id } = await req.json();

        if (!project_id) {
            return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
        }

        // 1. Fetch Project Details
        const { data: project } = await supabase.from('project_anchors').select('*').eq('id', project_id).single();
        if (!project) throw new Error("Project not found");

        // 2. Fetch all project_evidence to know what's already linked
        const { data: linkedEvidence } = await supabase.from('project_evidence').select('snippet_id').eq('project_id', project_id);
        const linkedSnippetIds = new Set(linkedEvidence?.map(e => e.snippet_id) || []);

        // 3. Fetch user snippets (or global if no user_id)
        let query = supabase.from('snippets').select('id, content').order('created_at', { ascending: false });
        if (user_id) {
            query = query.or(`user_id.eq.${user_id},user_id.is.null`);
        } else {
            query = query.is('user_id', null);
        }

        const { data: snippetsData, error: snippetsError } = await query;
        if (snippetsError) throw snippetsError;

        // Filter out already linked snippets
        const unlinkedSnippets = (snippetsData || []).filter(s => !linkedSnippetIds.has(s.id));

        if (unlinkedSnippets.length === 0) {
            return NextResponse.json({ suggestions: [] });
        }

        // Cap to latest 30 to save tokens (or use embeddings in the future)
        const candidates = unlinkedSnippets.slice(0, 30);

        // Prepare context for OpenAI
        const snippetContext = candidates.map(s => ({
            id: s.id,
            content: s.content.substring(0, 300) // Truncate content for prompt efficiency
        }));

        const prompt = `
You are an expert Project Assistant.
Project Title: ${project.name}
Core Objective: ${project.objective || project.description || 'Not specified'}
Target Audience: ${project.target_audience || 'Not specified'}
Current Stage: ${project.current_stage || 'IDEA'}
Knowledge Gaps: ${project.project_brief?.key_knowledge_gaps?.join(', ') || 'None identified yet'}

Here are a bunch of unlinked captures (snippets) from the user's inbox:
${JSON.stringify(snippetContext, null, 2)}

Instructions:
Identify up to 5 snippets that are HIGHLY relevant to pushing this specific project forward.
PRIORITIZE snippets that directly address the listed "Knowledge Gaps" or help advance the project from its "Current Stage".
For each selected snippet, provide its "id" and a 1-sentence "reasoning" (max 15 words) explaining why the user should link it to this project as Evidence (e.g. "Directly answers the gap regarding user pricing expectations").
If none are relevant, return an empty array.

Output strictly as JSON:
{
  "suggestions": [
    {
      "id": "string",
      "reasoning": "string"
    }
  ]
}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const responseText = completion.choices[0].message.content || "{}";
        const result = JSON.parse(responseText);

        return NextResponse.json({ suggestions: result.suggestions || [] });

    } catch (e: any) {
        console.error("Evidence suggestions failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
