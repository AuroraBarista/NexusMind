
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export async function POST(request: Request) {
    try {
        const { centerSnippet, neighborSnippets } = await request.json();
        const userLanguage = request.headers.get('x-user-language') || 'en';

        if (!centerSnippet) {
            return NextResponse.json({ error: "No center snippet provided" }, { status: 400 });
        }

        // Prepare context
        const context = `
        CENTER NODE:
        - Content: "${centerSnippet.content}"
        - Tags: [${centerSnippet.ai_tags?.join(", ")}]
        
        NEIGHBORS (${neighborSnippets.length}):
        ${neighborSnippets.map((n: any, i: number) => `${i + 1}. "${n.content}" [ID: ${n.id}]`).join("\n")}
        `;

        const systemPrompt = `You are the "Pattern Recognizer" for NexusMind.
        Your goal is to find the hidden thread connecting the user's selected thought (Center) with its surrounding neighbors.

        ### Goal
        Generate a "Knowledge Metabolism" insight that helps the user synthesize these visible connections.

        ### Output Format (JSON)
        {
            "insight": "Explain WHY these nodes are clustered. What is the common theme? (Max 2 sentences)",
            "action": "Suggest a concrete creative output combining them (e.g. 'Create a video about X using Y')."
        }
        
        ### Rules
        - If neighbors are few (<1), focus on expanding the center node.
        - Be concise, professional, and inspiring.
        - **Bilingual Rule**: You must output all text strings in the JSON in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: context }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Cluster Analysis Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
