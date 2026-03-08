
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Helper: Cosine Similarity (Dot Product for normalized vectors)
function cosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        magA += vecA[i] * vecA[i];
        magB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Fetch nodes (flexible filtering for testing)
        let query = supabase
            .from("snippets")
            .select("id, content, project_anchor, ai_tags, created_at, embedding, summary, is_processed, file_url, user_id")
            .order("created_at", { ascending: false })
            .limit(200);

        if (user?.id) {
            query = query.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
            query = query.is('user_id', null);
        }

        const { data: nodes, error } = await query;

        if (error) {
            console.error("Nebula Fetch Error:", error);
            throw error;
        }
        if (!nodes) return NextResponse.json({ nodes: [], links: [] });

        const links: any[] = [];

        // 2. Topology Algorithm (O(N^2))
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];

                // A. Hard Link Logic (Same Anchor + Shared Tags)
                let isHardLink = false;
                if (nodeA.project_anchor === nodeB.project_anchor) {
                    const tagsA = nodeA.ai_tags || [];
                    const tagsB = nodeB.ai_tags || [];
                    const intersection = tagsA.filter((t: string) => tagsB.includes(t));
                    if (intersection.length >= 2) {
                        isHardLink = true;
                    }
                }

                // B. Semantic Link Logic (Cosine Similarity)
                let isSemanticLink = false;
                let similarity = 0;

                // Parse embeddings
                let vecA: number[] | null = null;
                if (typeof nodeA.embedding === 'string') {
                    try {
                        vecA = JSON.parse(nodeA.embedding);
                    } catch (e) {
                        vecA = null;
                    }
                } else if (Array.isArray(nodeA.embedding)) {
                    vecA = nodeA.embedding;
                }

                let vecB: number[] | null = null;
                if (typeof nodeB.embedding === 'string') {
                    try {
                        vecB = JSON.parse(nodeB.embedding);
                    } catch (e) {
                        vecB = null;
                    }
                } else if (Array.isArray(nodeB.embedding)) {
                    vecB = nodeB.embedding;
                }

                if (vecA && vecB && vecA.length === vecB.length) {
                    similarity = cosineSimilarity(vecA, vecB);

                    if (similarity > 0.2) { // Lowered threshold
                        isSemanticLink = true;
                    }
                }

                // C. Create Link
                if (isHardLink || isSemanticLink) {
                    links.push({
                        source: nodeA.id,
                        target: nodeB.id,
                        type: isHardLink ? "hard" : "semantic",
                        value: isHardLink ? 10 : similarity * 5 // Weight
                    });
                }
            }
        }

        // Clean nodes payload
        const cleanNodes = nodes.map(n => ({
            id: n.id,
            content: n.content,
            group: n.project_anchor,
            val: 5,
            ai_tags: n.ai_tags,
            created_at: n.created_at,
            summary: n.summary,
            is_processed: n.is_processed,
            file_url: n.file_url,
            project_anchor: n.project_anchor
        }));

        return NextResponse.json({ nodes: cleanNodes, links });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
