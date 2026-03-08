import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { generateProjectSummary } from '@/utils/summary';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { period, date, forceRefresh, projectAnchor } = await req.json();

        const summary = await generateProjectSummary(supabase, {
            period,
            date,
            projectAnchor,
            forceRefresh
        });

        if (!summary) {
            return NextResponse.json({ message: "No content to summarize for this period/project" });
        }

        return NextResponse.json(summary);

    } catch (e: any) {
        console.error("Summary Generation Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
