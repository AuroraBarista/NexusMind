
import { NextResponse } from "next/server";

// Reusing the Mock Embedding Logic from process-brain
const generateMockEmbedding = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const embedding = new Array(1536);
    for (let i = 0; i < 1536; i++) {
        // Simple pseudo-random generator seeded by hash + index
        const val = Math.sin(hash + i) * 10000;
        embedding[i] = val - Math.floor(val) - 0.5; // -0.5 to 0.5
    }
    return embedding;
};

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

export async function POST(request: Request) {
    try {
        const { textA, textB } = await request.json();

        // 1. Generate Embeddings (Mock)
        const vecA = generateMockEmbedding(textA);
        const vecB = generateMockEmbedding(textB);

        // 2. Classify (Mock)
        const classify = (content: string) => {
            const isSocial = content.toLowerCase().includes("travel") || content.toLowerCase().includes("food") || content.toLowerCase().includes("social");
            const isInternship = content.toLowerCase().includes("finance") || content.toLowerCase().includes("job") || content.toLowerCase().includes("intern");
            return isSocial ? "social" : (isInternship ? "internship" : "academic");
        }

        const anchorA = classify(textA);
        const anchorB = classify(textB);

        // 3. MOCK AI ANALYSIS AGENT
        // This simulates a GPT-4 analysis of the relationship
        let reasoning = "";
        let aiSimilarity = 0;
        let scale = 0; // 1-5 Scale

        const contentA = textA.toLowerCase();
        const contentB = textB.toLowerCase();

        // Rule-based Mock AI for Demonstration
        if (
            (contentA.includes("travel") && contentB.includes("finance")) ||
            (contentA.includes("finance") && contentB.includes("travel"))
        ) {
            aiSimilarity = 0.05;
            scale = 1;
            reasoning = "Legacy semantic vector mapping detected low logical correlation. Subject A (Leisure/Travel) vs Subject B (Finance/Career) belong to distinct orthogonal clusters. No direct causal path found.";
        } else if (
            (contentA.includes("finance") && contentB.includes("money")) ||
            (contentA.includes("algorithm") && contentB.includes("code"))
        ) {
            aiSimilarity = 0.85;
            scale = 5;
            reasoning = "High semantic overlap detected. Both subjects operate within the same domain. Shared entities confirmed.";
        } else {
            // Default fallback using the hash-based vector for "unknown" inputs
            const sim = cosineSimilarity(vecA, vecB);
            aiSimilarity = sim;
            scale = Math.max(1, Math.min(5, Math.ceil(sim * 5))); // Map 0-1 to 1-5
            reasoning = "General semantic analysis performed using vector embeddings. Moderate correlation found based on linguistic patterns.";
        }

        return NextResponse.json({
            similarity: aiSimilarity,
            scale: scale,
            reasoning: reasoning, // AI explanation
            analysisA: {
                text: textA,
                anchor: anchorA,
                vectorPreview: vecA.slice(0, 5)
            },
            analysisB: {
                text: textB,
                anchor: anchorB,
                vectorPreview: vecB.slice(0, 5)
            }
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
