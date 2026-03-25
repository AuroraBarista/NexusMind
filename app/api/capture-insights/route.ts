import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function GET(req: Request) {
    const userLanguage = req.headers.get('x-user-language') || 'en';

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let userId = user?.id;
        // DEVELOPMENT BYPASS: If no user, we might be in the auth-bypass testing mode.
        // We'll allow the query to proceed without a hard error, but ideally we find data.
        // If we want to see the test data we inserted (which has user_id: null), we need to handle that.

        // Fetch recent captures (not associated with any settled project)
        let query = supabase
            .from('snippets')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(30);

        if (userId) {
            // Broaden to include both user-specific and unassigned/demo data
            query = query.or(`user_id.eq.${userId},user_id.is.null`);
        } else {
            // For testing: if no user, check for snippets with null user_id
            query = query.is('user_id', null);
        }

        // Broaden the "Unassigned" definition:
        // Include null, empty, inbox, and the default AI buckets (academic, social, internship) 
        // as long as they aren't part of a formal user project (simplified check for now)
        query = query.or('project_anchor.is.null,project_anchor.eq."",project_anchor.eq.inbox,project_anchor.eq.academic,project_anchor.eq.social,project_anchor.eq.internship,project_anchor.eq."Build an app",project_anchor.eq."iOS Development",project_anchor.eq."Finance Examination Review"');

        const { data: captures, error } = await query;

        if (error) {
            console.error('Error fetching captures:', error);
            return NextResponse.json({ error: 'Failed to fetch captures' }, { status: 500 });
        }

        if (!captures || captures.length === 0) {
            return NextResponse.json({
                message: "No unassigned captures found.",
                insights: null
            });
        }

        // Extract text content for analysis
        const captureTexts = captures.map((c: any) => `[ID: ${c.id}, DATE: ${c.created_at}] ${c.content}`).join('\n---\n');

        const prompt = `
            You are an advanced AI Insights Engine for a Second Brain application.
            Your task is to analyze a user's raw "Capture" data (fragments of information, links, thoughts) and generate strictly QUANTITATIVE insights.
            
            CRITICAL RULE: You must ONLY base your insights on the provided Capture data. Do not invent information.
            CRITICAL RULE: Your insights MUST be quantitative. Use precise numbers, counts, and ratios (e.g., "7 out of 10", "45%").
            CRITICAL RULE: Do NOT output vague summaries like "You are interested in AI." Instead output "8 of your last 12 captures are about AI tools."
            CRITICAL RULE: You must output your entire JSON response (all text fields including summaries, descriptions, and topics) in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}. Keep keys in English.

            Analyze the following recent captures:
            <captures>
            ${captureTexts}
            </captures>

            Generate a JSON response strictly matching this structure:
            {
                "summary": "A one-sentence quantitative summary of recent capture activity (e.g., 'You captured 15 items this week, with 60% focused on engineering.')",
                "topic_distribution": [
                    { "topic": "Name of topic", "count": 5, "percentage": 33 }
                ],
                "topic_trends": "A short sentence describing a trend based on timestamps or content clusters (e.g., 'Captures related to UI design increased in the last 2 days.')",
                "project_opportunities": [
                    { 
                        "title": "Suggested Project Name", 
                        "reason": "Quantitative reason (e.g., '9 captures are related to this specific topic cluster.')" 
                     }
                ],
                "knowledge_gaps": [
                    {
                        "topic": "Area with missing info",
                        "description": "Quantitative description of the gap (e.g., 'You have 7 captures on Swift Data, but 0 on CloudKit syncing.')"
                    }
                ],
                "important_signals": [
                    {
                        "description": "Description of a high-value signal found in the data (e.g., '2 captures contain potential startup competitor analysis.')"
                    }
                ]
            }
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.2,
        });

        const responseText = completion.choices[0].message.content || "{}";

        try {
            const jsonInsights = JSON.parse(responseText);
            return NextResponse.json({ insights: jsonInsights });
        } catch (parseError) {
            console.error("Failed to parse JSON from OpenAI:", responseText);
            return NextResponse.json({ error: "Failed to generate structured insights" }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Insights generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
