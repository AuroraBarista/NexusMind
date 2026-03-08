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
    const userLanguage = req.headers.get('x-user-language') || 'en';

    try {
        const { project_id } = await req.json();

        if (!project_id) {
            return NextResponse.json({ error: 'Missing project_id' }, { status: 400 });
        }

        // Fetch Project Data
        const { data: project, error: pError } = await supabase
            .from('project_anchors')
            .select('*')
            .eq('id', project_id)
            .single();

        if (pError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch explicitly linked Evidence Data
        const { data: evidence, error: eError } = await supabase
            .from('project_evidence')
            .select(`
                type,
                relevance_score,
                summary,
                insight,
                decision_impact,
                snippet:snippets(content)
            `)
            .eq('project_id', project_id);

        if (eError) {
            throw new Error('Failed to fetch evidence');
        }

        // Prepare context for OpenAI
        const evidenceContext = evidence.map((e: any) => ({
            type: e.type,
            relevance: e.relevance_score,
            content: e.snippet?.content || e.summary,
            insight: e.insight,
            decision_impact: e.decision_impact
        }));

        const prompt = `
You are an expert Project Operating System AI acting as an Engine State Machine.
Analyze the following project and its evidence to advance the project state.

IMPORTANT: You must output your entire JSON response (all text strings) in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}.

Project Title: ${project.name}
Core Objective: ${project.objective || project.description}
Target Audience: ${project.target_audience || 'Not specified'}

Evidence Context(${evidenceContext.length} items):
${JSON.stringify(evidenceContext, null, 2)}

        Instructions:
        1. "current_stage": Based strictly on the objective and evidence, evaluate the project's current state. Must be one of: 'IDEA', 'RESEARCH', 'VALIDATION', 'PROTOTYPE', 'BUILD', 'LAUNCH'.
        2. "health_score": Provide an EXPLAINABLE quantitative / qualitative checklist for four dimensions("check" or "alert"):
            - "idea_clarity": e.g., [{ "label": "Objective defined", "status": "check" }, { "label": "Audience missing", "status": "alert" }]
                - "evidence_strength": e.g., [{ "label": "Research evidence", "count": 2, "status": "check" }]
                    - "execution_readiness": e.g., [{ "label": "Prototype missing", "status": "alert" }]
                        - "momentum": Analyze recent progress based on evidence depth.Provide a "status"('High', 'Medium', 'Low') and a "reason" string(e.g. "Solid foundational research gathered").
3. "next_action_details": Generate an operational breakdown for the immediate next thing to do.
   - "action": Single sentence(max 10 words).
   - "reason": Why this action is critical now.
   - "expected_outcome": What producing this action will unlock.
   - "steps": Array of 3 - 5 concrete micro - steps to execute.
4. "project_brief": Generate a quick executive summary: "objective", "current_stage"(match above), "progress", "next_action"(match action above), and "key_knowledge_gaps" array.
5. "recommendations": Recommend 2 specific topics to fill knowledge gaps.
6. "roadmap": Output an array with these exact 6 steps: [{ "step": "Idea", "status": "" }, { "step": "Research", ...}, { "step": "Validation", ...}, { "step": "Prototype", ...}, { "step": "Build", ...}, { "step": "Launch", ...}].Status must be 'completed', 'active', or 'pending'.Only one can be 'active' corresponding to the "current_stage".
7. "progress": Calculate an overall completion percentage(0 - 100).

Output strictly as JSON:
        {
            "current_stage": "string",
                "health_score": {
                "idea_clarity": [{ "label": "string", "status": "string" }],
                    "evidence_strength": [{ "label": "string", "count": "number", "status": "string" }],
                        "execution_readiness": [{ "label": "string", "status": "string" }],
                            "momentum": { "status": "string", "reason": "string" }
            },
            "next_action": "string",
                "next_action_details": {
                "action": "string",
                    "reason": "string",
                        "expected_outcome": "string",
                            "steps": ["string", "string", "string"]
            },
            "project_brief": {
                "objective": "string",
                    "current_stage": "string",
                        "progress": "string",
                            "next_action": "string",
                                "key_knowledge_gaps": ["string", "string"]
            },
            "recommendations": ["string", "string"],
                "roadmap": [{ "step": "string", "status": "string" }],
                    "progress": number
        }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const responseText = completion.choices[0].message.content || "{}";
        const aiInsights = JSON.parse(responseText);

        // Update Project with new AI Insights
        const { error: updateError } = await supabase
            .from('project_anchors')
            .update({
                health_score: aiInsights.health_score,
                next_action: aiInsights.next_action_details?.action || aiInsights.next_action,
                next_action_details: aiInsights.next_action_details,
                current_stage: aiInsights.current_stage,
                project_brief: aiInsights.project_brief,
                roadmap: aiInsights.roadmap,
                progress: aiInsights.progress,
            })
            .eq('id', project_id);

        if (updateError) {
            console.error("Failed to update project", updateError);
            throw new Error('Database update failed');
        }

        return NextResponse.json({ ...aiInsights });

    } catch (e: any) {
        console.error("AI Insight generation failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
