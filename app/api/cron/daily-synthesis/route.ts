import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/utils/telegram";
import { generateProjectSummary } from "@/utils/summary";

export const runtime = 'edge';

export async function GET(req: Request) {
    // 1. Security Check (Optional but recommended for Cron)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return new Response('Unauthorized', { status: 401 });
    }

    try {
        const supabase = await createClient();

        // 2. Fetch active projects (strict filter)
        const { data: anchors } = await supabase.from('project_anchors').select('name');
        const projects = anchors
            ?.map(a => a.name.toLowerCase())
            .filter(name => ['academic', 'intern'].includes(name)) || ['academic', 'intern'];

        const logs: string[] = [];
        logs.push(`Starting daily synthesis for: ${projects.join(', ')}`);

        // 3. Loop through projects and generate summaries
        for (const project of projects) {
            try {
                const summary = await generateProjectSummary(supabase, {
                    period: 'daily',
                    projectAnchor: project,
                    forceRefresh: true
                });

                if (summary && summary.summary_content) {
                    const insight = summary.summary_content.quantitative_pulse.insight;
                    const message = `<b>[${project.toUpperCase()} DAILY NEXUS]</b>\n\n${insight}\n\n<i>Generated automatically by NexusMind</i>`;
                    await sendTelegramMessage(message);
                    logs.push(`Sent report for ${project}`);
                } else {
                    logs.push(`No content for ${project} today.`);
                }
            } catch (err: any) {
                logs.push(`Error processing ${project}: ${err.message}`);
            }
        }

        return NextResponse.json({ success: true, logs });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
