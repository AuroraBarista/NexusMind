
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Ensure real-time data

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Fetch All Snippets
    const { data: snippets, error } = await supabase
        .from("snippets")
        .select("*")
        .order("created_at", { ascending: false });

    if (error || !snippets) {
        return NextResponse.json({ error: error?.message || "No data" }, { status: 500 });
    }

    // 2. Map Nodes
    const nodes = snippets.map(s => ({
        id: s.id,
        group: s.project_anchor || "default",
        val: s.file_url ? 40 : 20, // Keep the large sizes
        ...s // Pass through all props for UI (summary, tags, content)
    }));

    // 3. Generate Links (Topology Logic)
    const links: any[] = [];
    const linkSet = new Set(); // To prevent duplicates (A-B and B-A)

    for (let i = 0; i < snippets.length; i++) {
        for (let j = i + 1; j < snippets.length; j++) {
            const nodeA = snippets[i];
            const nodeB = snippets[j];

            // Avoid self-loops (handled by j=i+1)

            // HARD LINK: Semantic (Tags >= 2)
            const tagsA = nodeA.ai_tags || [];
            const tagsB = nodeB.ai_tags || [];
            const commonTags = tagsA.filter((t: string) => tagsB.includes(t));

            if (commonTags.length >= 2) {
                links.push({
                    source: nodeA.id,
                    target: nodeB.id,
                    type: "hard",
                    value: commonTags.length, // Stronger pull for more overlap
                    commonTags
                });
                continue; // If hard linked, don't add soft link
            }

            // SOFT LINK: Contextual (Same Anchor + Time < 24h)
            if (nodeA.project_anchor === nodeB.project_anchor) {
                const timeA = new Date(nodeA.created_at).getTime();
                const timeB = new Date(nodeB.created_at).getTime();
                const hoursDiff = Math.abs(timeA - timeB) / (1000 * 60 * 60);

                if (hoursDiff < 24) {
                    links.push({
                        source: nodeA.id,
                        target: nodeB.id,
                        type: "soft",
                        value: 1, // Weak pull
                        reason: "temporal search"
                    });
                }
            }
        }
    }

    return NextResponse.json({ nodes, links });
}
