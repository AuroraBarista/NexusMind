
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProjectSummary(supabase: any, {
    period,
    date,
    projectAnchor,
    forceRefresh = false
}: {
    period: 'daily' | 'weekly' | 'monthly',
    date?: string,
    projectAnchor: string | null,
    forceRefresh?: boolean
}) {
    // 1. Calculate Time Range
    const now = date ? new Date(date) : new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);

    if (period === 'daily') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'weekly') {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
    } else if (period === 'monthly') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
    }

    // 2. Check Cache
    if (!forceRefresh) {
        let query = supabase
            .from('summaries')
            .select('*')
            .eq('period_type', period)
            .gte('period_start', startDate.toISOString())
            .lte('period_end', endDate.toISOString());

        if (projectAnchor) {
            query = query.eq('project_anchor', projectAnchor);
        } else {
            query = query.is('project_anchor', null);
        }

        const { data: existing } = await query.limit(1).maybeSingle();
        if (existing) return existing;
    }

    // 3. Fetch Snippets
    let snippetsQuery = supabase
        .from('snippets')
        .select('content, summary, created_at, ai_tags, project_anchor, file_url')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

    if (projectAnchor) {
        snippetsQuery = snippetsQuery.eq('project_anchor', projectAnchor);
    }

    const { data: snippets, error } = await snippetsQuery;
    if (error) throw error;
    if (!snippets || snippets.length === 0) return null;

    const snippetCount = snippets.length;
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const capturedToday = snippets.filter((s: any) => new Date(s.created_at) >= todayStart).length;

    // 4. Calculate Stats
    const mediaDistribution = { web: 0, text: 0, image: 0, file: 0 };
    const anchorCounts: Record<string, number> = {};

    snippets.forEach((s: any) => {
        if (s.content.includes('[WEB_CAPTURE]')) mediaDistribution.web++;
        else if (s.file_url) {
            if (s.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) mediaDistribution.image++;
            else mediaDistribution.file++;
        } else {
            mediaDistribution.text++;
        }
        const anchor = s.project_anchor || "Uncategorized";
        anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
    });

    const topAnchor = Object.entries(anchorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";
    const anchorDistribution = Object.entries(anchorCounts)
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / snippetCount) * 100) }))
        .sort((a, b) => b.count - a.count);

    // 5. Generate AI Summary
    const contextText = snippets.map((s: any) => `
    - [${s.project_anchor}] (${s.created_at.substring(0, 10)}): ${s.content.substring(0, 500)}
    - Tags: ${s.ai_tags?.join(', ')}
    - AI Analysis: ${s.summary}
    `).join('\n\n');

    const systemPrompt = `
    You are the "Professional Nexus Analyst," an elite intelligence strategist. 
    Your goal is to synthesize fragmented Information Slices into a cohesive "Nexus Intelligence Report."
    
    Focus: ${projectAnchor ? `This report is specifically for the project: "${projectAnchor}"` : "This is a global cross-project report."}

    SYNTHESIS PROTOCOLS:
    1. PRIORITY INTELLIGENCE: Identify exactly 2-4 of the most critical factual snippets. These must be "True Signals" that advance user goals.
    2. NOISE ELIMINATION: Do not force relationships where none exist.
    3. FACTUAL SUMMARY: Focus on what was *actually* captured.
    4. STRATEGIC SYNTHESIS: Only synthesize if there is a clear, logical thread.

    OUTPUT FORMAT (JSON ONLY):
    {
        "quantitative_pulse": {
            "insight": "One powerful, data-backed sentence about the current information trajectory."
        },
        "intelligence_priority": [
            {
                "title": "Specific Factual Headline",
                "value": "Concise explanation of the signal's priority.",
                "tag": "Category"
            }
        ],
        "curated_top_10": [
            {
                "rank": 1,
                "title": "Synthesis Headline",
                "core_insight": "The core synthesized value.",
                "action_suggestion": "Practical next step.",
                "relevance_score": 0-10,
                "entropy_score": 0-10,
                "tag": "Domain"
            }
        ]
    }
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-5.4",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Synthesize this raw intelligence stream:\n${contextText}` }
        ],
        response_format: { type: "json_object" }
    });

    const aiData = JSON.parse(completion.choices[0].message.content || '{}');
    const finalContent = {
        ...aiData,
        stats: {
            total_count: snippetCount,
            captured_today: capturedToday,
            velocity: snippetCount,
            media_distribution: mediaDistribution,
            anchor_distribution: anchorDistribution,
            top_anchor: topAnchor
        }
    };

    // 6. Save to DB
    const { data: newSummary, error: insertError } = await supabase
        .from('summaries')
        .insert([{
            period_type: period,
            period_start: startDate.toISOString(),
            period_end: endDate.toISOString(),
            summary_content: finalContent,
            project_anchor: projectAnchor || null
        }])
        .select()
        .single();

    if (insertError) {
        console.error("Failed to save summary:", insertError);
        return { summary_content: finalContent };
    }

    return newSummary;
}
