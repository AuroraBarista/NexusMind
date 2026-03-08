import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Fetch User Session
        const userLanguage = req.headers.get('x-user-language') || 'en';

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        let userId = session?.user?.id;

        // DEVELOPMENT BYPASS: If no user, we might be in the auth-bypass testing mode.
        if (!userId) {
            userId = 'fb0aa667-8c38-4e1b-85fe-51fb789ab921'; // Global Demo User ID
        }

        // 2. Fetch Active Projects Context
        const { data: projects, error: projectsError } = await supabase
            .from('project_anchors')
            .select(`
                id,
                name,
                objective,
                current_stage,
                health_score,
                next_action_details,
                created_at,
                project_evidence (
                    id,
                    type,
                    insight,
                    decision_impact,
                    created_at
                )
            `)
            .order('created_at', { ascending: false });

        if (projectsError) {
            console.error("Error fetching projects for briefing:", projectsError);
            return NextResponse.json({ error: projectsError.message }, { status: 500 });
        }

        // 3. Format Data for the AI prompt
        const now = new Date();
        const projectsContext = projects.map(p => {
            const lastUpdated = new Date(p.created_at).getTime();
            const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated) / (1000 * 3600 * 24));

            const evidenceCount = p.project_evidence?.length || 0;
            const recentEvidence = p.project_evidence?.filter((e: any) => {
                const age = Math.floor((now.getTime() - new Date(e.created_at).getTime()) / (1000 * 3600 * 24));
                return age <= 3;
            }).length || 0;

            const insightsCount = p.project_evidence?.filter((e: any) => e.insight).length || 0;

            return {
                name: p.name,
                objective: p.objective,
                current_stage: p.current_stage || "UNKNOWN",
                days_since_active: daysSinceUpdate,
                total_evidence: evidenceCount,
                recent_evidence_last_3_days: recentEvidence,
                total_insights_generated: insightsCount,
                momentum_health: p.health_score?.momentum?.status || "UNKNOWN",
                current_next_action: p.next_action_details?.action || "None tracked"
            };
        });

        // 4. Generate the Briefing using OpenAI JSON Mode
        const prompt = `
        You are the "NexusMind Daily Briefing" AI. Your job is to analyze the user's active projects and generate a highly structured morning report.
        You act as an executive assistant prioritizing their attention for the day.
        
        IMPORTANT: You must output your entire analysis and all text fields within the JSON response in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}. Keep the JSON keys exactly as requested.
        
        Today's Date: ${now.toLocaleDateString()}
        
        Project Portfolio Context:
        ${JSON.stringify(projectsContext, null, 2)}
        
        Instructions:
        1. "progress_summary": Write a 2-3 sentence overview of the portfolio's overall momentum.
        2. "went_well": Provide an array of 2-3 positive feedback points (e.g. "Great job adding 3 pieces of evidence to Project X", "Project Y reached Validation").
        3. "needs_attention": Provide an array of 2-3 risks or blockers (e.g. "Project Z hasn't been updated in 5 days", "Project W lacks insights"). High priority.
        4. "suggested_improvements": Provide an array of 2 strategic suggestions to improve their progress across any project.
        5. "next_action": 
           - "action": The SINGLE most important thing the user should do today.
           - "reason": Why this specific action is the highest priority.
           
        Return ONLY a logical JSON structure matching the exact keys requested. Make it sound professional, crisp, and cyber-aesthetic.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const briefingRaw = response.choices[0].message.content;
        const briefingJson = JSON.parse(briefingRaw || "{}");

        return NextResponse.json({ success: true, data: briefingJson });
    } catch (error: any) {
        console.error('Daily briefing error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
