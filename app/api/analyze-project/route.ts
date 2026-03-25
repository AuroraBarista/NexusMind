
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { projectName } = await req.json();
        const userLanguage = req.headers.get('x-user-language') || 'en';

        if (!projectName) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        // 1. Fetch Project Context (Goal & Requirements)
        // Try exact match first
        let { data: project, error: projectError } = await supabase
            .from('project_anchors')
            .select('*')
            .eq('name', projectName)
            .maybeSingle();

        // If not found, try case-insensitive
        if (!project) {
            const { data: projectCi } = await supabase
                .from('project_anchors')
                .select('*')
                .ilike('name', projectName)
                .maybeSingle();
            project = projectCi;
        }

        // If still not found, check 'projects' table as fallback (legacy support)
        if (!project) {
            const { data: legacyProject } = await supabase
                .from('projects')
                .select('*')
                .ilike('name', projectName)
                .maybeSingle();

            if (legacyProject) {
                // Construct a temporary project object with defaults
                project = {
                    name: legacyProject.name,
                    goal_description: `Analyze context for project: ${legacyProject.name}`,
                    requirements_doc: null
                };
            }
        }

        if (!project) {
            console.error(`Project not found: ${projectName}`);
            return NextResponse.json({ error: `Project '${projectName}' not found in database.` }, { status: 404 });
        }

        const goal = project.goal_description || "No specific goal defined.";

        let requirementsText = "";
        if (project.requirements_doc) {
            // Handle potentially different structures if we evolve requirements_doc
            const doc = project.requirements_doc as any;
            requirementsText = doc.extracted_text || JSON.stringify(doc);
        }

        // 2. Fetch Recent Snippets (Evidence)
        const { data: snippets, error: snippetsError } = await supabase
            .from('snippets')
            .select('id, content, type, created_at, file_url')
            .eq('project_anchor', projectName)
            .order('created_at', { ascending: false })
            .limit(40); // Increased context slightly

        if (snippetsError) throw snippetsError;

        // 3. Construct the Prompt
        const systemPrompt = `You are an expert Investigator and Research Synthesizer for a user's second brain.
Your role is to compare the User's Project Goal + Requirements against the Collected Web Snippets (Evidence).
Your goal is NOT to grade information, but to connect the dots between fragmented clues to build a cohesive understanding for the user's project.

**Philosophy**:
- No piece of information is useless. Even a "low relevance" item might provide necessary context, a counter-argument, or a creative spark.
- Focus on Relationships. How does Item A relate to Item B? Does it support, contradict, explain, or provide an alternative to it?
- Narrative over Numbers. Do not use numerical scores. Instead, explain the *functional role* of the information.

Return a strict JSON object matching this structure:
{
  "phase_info": {
    "current_phase": "Phase Name (e.g., Discovery, Data Collection, Synthesis, Review)",
    "status": "ON_TRACK" | "DRIFTING" | "OFF_TRACK",
    "message": "Brief status summary (max 15 words).",
    "detour_suggestion": "Actionable advice if drifting/off-track, else null."
  },
  "gap_analysis": [
    {
      "gap_id": number,
      "description": "Specific missing information (e.g. 'Q3 Revenue Data').",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "search_query": "Optimized Google search query to find this missing info (e.g. 'Tesla Q3 2024 revenue report pdf')"
    }
  ],
  "synthesized_narrative": "A short paragraph weaving the most important snippets together into a coherent story or strategy. Tell the user what they have successfully gathered and how the pieces connect.",
  "item_analysis": [
    {
      "snippet_id": "UUID from input",
      "title": "Short display title",
      "role": "Core Evidence" | "Context" | "Contradiction" | "Inspiration" | "Noise",
      "connection_to": ["UUID_of_related_snippet_1", "UUID_of_related_snippet_2"],
      "insight": "First, briefly summarize what this evidence says. Then, explicitly explain its value/helpfulness to the project goal (or why it is not helpful). e.g., 'Summary: Discusses B2C habit tracking. Value: Provides inspiration for gamifying our B2B daily streaks.'"
    }
  ],
  "socratic_question": "One deep, specific, provocative question linking two pieces of evidence or challenging a core assumption."
}
**Rules**:
- **Bilingual Output**: You must output all text strings, insights, missing info descriptions, and narratives in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}. Keep the JSON keys in English.
- **Phase Detection**: Infer the phase based on evidence count and quality. (Few docs = Discovery; Many docs = Synthesis).
- **connection_to**: Leave as an empty array [] if the item has no clear connections to other items. Do not invent connections if none exist.
- **Noise Role**: If an item is practically useless, tag it as "Noise" but explain *why* it's noise in the insight (e.g., "Outdated API docs, serving as a reminder of legacy approaches").
`;

        const userContent = `
Project Name: ${projectName}
Project Goal: ${goal}
Requirements Document:
${requirementsText.substring(0, 5000)}

Collected Evidence (Snippets):
${JSON.stringify(snippets?.map(s => ({
            id: s.id,
            content: s.content.substring(0, 300), // Truncate
            type: s.type,
            date: s.created_at
        })))}
`;

        // 4. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-5.4", // Or gpt-3.5-turbo if cost is concern, but 5.4 is better for reasoning
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            temperature: 0.7,
        });

        const analysisJson = completion.choices[0].message.content;

        if (!analysisJson) {
            throw new Error("Failed to generate analysis");
        }

        const analysisData = JSON.parse(analysisJson);

        // Inject execution_plan into the response
        const completeAnalysis = {
            ...analysisData,
            execution_plan: project.execution_plan || null
        };

        return NextResponse.json({ success: true, analysis: completeAnalysis });

    } catch (error: any) {
        console.error("Project Analysis Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
