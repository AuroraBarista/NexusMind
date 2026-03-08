import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as cheerio from 'cheerio';

// Polyfill for pdf-parse in Node environment
if (typeof Promise.withResolvers === "undefined") {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

// @ts-ignore
if (!global.DOMMatrix) {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            // @ts-ignore
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        }
    };
}
// @ts-ignore
if (!global.ImageData) {
    // @ts-ignore
    global.ImageData = class ImageData { };
}
// @ts-ignore
if (!global.Path2D) {
    // @ts-ignore
    global.Path2D = class Path2D { };
}

// @ts-ignore
// @ts-ignore
const pdf = require("pdf-parse/lib/pdf-parse.js");

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

export async function POST(request: Request) {
    const userLanguage = request.headers.get('x-user-language') || 'en';
    let snippetId: string | null = null;
    let snippet: any = null;

    try {
        const body = await request.json();
        snippetId = body.snippetId;

        if (!snippetId) {
            return NextResponse.json({ error: "No snippetId provided" }, { status: 400 });
        }

        // 1. Fetch Snippet
        const { data: fetchSnippet, error: fetchError } = await supabase
            .from("snippets")
            .select("*")
            .eq("id", snippetId)
            .single();

        if (fetchError || !fetchSnippet) {
            return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
        }

        snippet = fetchSnippet;

        // 1.5 Fetch Dynamic Project Anchors & User Projects
        const { data: anchors } = await supabase.from('project_anchors').select('name, description');
        const { data: userProjects } = await supabase.from('projects').select('name');

        const combinedAnchors = [
            ...(anchors || []),
            ...(userProjects || []).map(p => ({ name: p.name, description: 'User Project' }))
        ];

        const anchorList = combinedAnchors.length > 0
            ? combinedAnchors.map(a => `- **${a.name}** (${a.description})`).join('\n    ')
            : `- **academic** (CS/Math/Research)\n    - **social** (Video Creation/Strategy/Editing)\n    - **internship** (Resume/Interview/Corporate)`;

        const anchorNames = combinedAnchors.length > 0
            ? combinedAnchors.map(a => `"${a.name}"`).join(' | ')
            : '"academic" | "intern"';

        // 2. High-Res System Prompt
        let systemPrompt = `Role: You are the "Knowledge Slicer" for NexusMind.
    Your goal is to turn vague content into sharp, actionable "Knowledge Slices".
    
    IMPORTANT: You must output all text content in your JSON response in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}. Maintain the exact JSON keys as requested.

    ### 1. Classification
    Classify input into ONE Project Anchor from the following list:
    ${anchorList}

    ### 2. Core Extraction
    Extract 1-3 **Hard-Core Professional Terms** from the content (OCR/Text).
    - EXAMPLES: #DepreciationSchedule, #ReactConcurrency, #JDScreening, #RuleOfThirds.
    - REJECT: #Study, #Work, #Life.

    ### 3. Comprehensive Summary
    Provide a deep, professional summary of the content in a single coherent paragraph (3-5 sentences).
    - Focus on the *specifics* of the file/text (numbers, specific algorithms, key arguments).
    - Avoid generic fluff like "This document discusses...". Start directly with the core insight.
    - If it's a technical document, explain the technical solution.
    - If it's an image/screenshot, describe exactly what is shown and its professional implication.

    ### 4. Semantic Vector (Placeholder)
    Generate a mock 3-dimensional vector [0.12, -0.45, 0.88] representing the concept's position in "Knowledge Space".

    ### Output JSON:
    {
      "project_anchor": ${anchorNames},
      "summary": "Full detailed summary string...",
      "tags": ["#HardCoreTerm1", "#HardCoreTerm2"],
      "semantic_vector": [0.1, 0.2, 0.3]
    }`;

        // 3. Prepare Messages
        const messages: any[] = [
            { role: "system", content: systemPrompt },
        ];

        let contentAnalysisContext = snippet.content || "";

        // [FEATURE] Web Scraping for Links
        // Detect "URL: https://..." or just "https://..." in content
        const urlMatch = contentAnalysisContext.match(/URL:\s*(https?:\/\/[^\s]+)/) || contentAnalysisContext.match(/(https?:\/\/[^\s]+)/);

        // Only scrape if no direct file_url (PDF/Image) is attached, OR if it's explicitly a Web Capture
        if (urlMatch && (!snippet.file_url || contentAnalysisContext.includes("[WEB_CAPTURE]"))) {
            const targetUrl = urlMatch[1];
            console.log("Attempting to scrape URL:", targetUrl);

            try {
                // 30s Timeout + No Cache for Debugging
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000);

                const res = await fetch(targetUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; NexusMindBot/1.0; +http://nexusmind.ai)'
                    },
                    signal: controller.signal,
                    cache: 'no-store'
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const html = await res.text();
                    const $ = cheerio.load(html);

                    // Clean up clutter
                    $('script, style, nav, footer, iframe, svg, noscript').remove();

                    const title = $('title').text().trim();
                    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || "";

                    // Extract main content - simplistic approach
                    const mainText = $('article').length ? $('article').text() :
                        $('main').length ? $('main').text() :
                            $('body').text();

                    const cleanText = mainText.replace(/\s+/g, ' ').trim().substring(0, 15000); // 15k chars limit

                    contentAnalysisContext += `\n\n=== SCRAPED CONTENT FROM ${targetUrl} ===\nTitle: ${title}\nDescription: ${metaDesc}\n\nMain Content:\n${cleanText}\n====================================`;
                } else {
                    console.warn(`Failed to fetch ${targetUrl}: ${res.status}`);
                    contentAnalysisContext += `\n[System: Could not scrape URL (Status ${res.status}). Analyzing based on title/metadata provided.]`;
                }
            } catch (err: any) {
                console.error("Scraping error:", err);
                contentAnalysisContext += `\n[System: Web scraping failed. Error: ${err.message}]`;
            }
        }

        if (snippet.file_url) {
            const lowerUrl = snippet.file_url.toLowerCase();
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(lowerUrl);
            const isPdf = /\.pdf$/.test(lowerUrl);

            if (isImage) {
                console.log("Processing Image (Base64):", snippet.file_url);
                try {
                    const imgRes = await fetch(snippet.file_url);
                    const arrayBuffer = await imgRes.arrayBuffer();
                    const base64 = Buffer.from(arrayBuffer).toString('base64');
                    // Get mime type from file extension or header
                    const mimeType = lowerUrl.endsWith('.png') ? 'image/png' :
                        lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') ? 'image/jpeg' :
                            lowerUrl.endsWith('.webp') ? 'image/webp' :
                                lowerUrl.endsWith('.gif') ? 'image/gif' : 'image/jpeg';

                    messages.push({
                        role: "user",
                        content: [
                            { type: "text", text: `Analyze this visual content strictly following the system guidelines: ${contentAnalysisContext}` },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64}`,
                                    detail: "high"
                                },
                            },
                        ],
                    });
                } catch (e) {
                    console.error("Image Fetch Error:", e);
                    // Fallback to URL if fetch fails
                    messages.push({
                        role: "user",
                        content: [
                            { type: "text", text: `Analyze this content: ${contentAnalysisContext}` },
                            { type: "image_url", image_url: { url: snippet.file_url, detail: "high" } },
                        ],
                    });
                }
            } else if (isPdf) {
                console.log("Processing PDF:", snippet.file_url);
                try {
                    const fileRes = await fetch(snippet.file_url);
                    const arrayBuffer = await fileRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const data = await pdf(buffer);

                    // Truncate if too long (approx 20k chars ~ 5k tokens to save limit)
                    const extractedText = data.text.substring(0, 30000);

                    messages.push({
                        role: "user",
                        content: `Analyze this document content (PDF Extraction):
                        
${contentAnalysisContext}

--- DOCUMENT CONTENT ---
${extractedText}
                        `
                    });
                } catch (err: any) {
                    console.error("PDF Parse Failed:", err);
                    messages.push({
                        role: "user",
                        content: `Analyze this content (PDF Parse Failed, rely on metadata): ${contentAnalysisContext} [File: ${snippet.file_url}]`
                    });
                }
            } else {
                // Assume Text/Code
                try {
                    const textContent = await fetch(snippet.file_url).then(r => r.text());
                    messages.push({
                        role: "user",
                        content: `Analyze this file content:
                        
${contentAnalysisContext}

--- FILE CONTENT ---
${textContent.substring(0, 30000)}
                        `
                    });
                } catch (err) {
                    messages.push({
                        role: "user",
                        content: contentAnalysisContext
                    });
                }
            }
        } else {
            messages.push({
                role: "user",
                content: contentAnalysisContext,
            });
        }

        // 4. Call OpenAI (gpt-4o-mini is efficient enough if prompt is good)
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            response_format: { type: "json_object" },
            temperature: 0.3, // Lower temperature for more focused/deterministic outputs
            max_tokens: 1000,
        });

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        // 5. Generate Embedding (Vector)
        // Combine content and summary for richer semantic search
        const textToEmbed = `${snippet.content || ""} ${result.summary || ""}`.trim();

        let embedding = null;
        if (textToEmbed) {
            const embeddingResp = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: textToEmbed,
                encoding_format: "float",
            });
            embedding = embeddingResp.data[0].embedding;
        }

        // 6. Update Supabase
        const { error: updateError } = await supabase
            .from("snippets")
            .update({
                summary: result.summary,
                ai_tags: result.tags,
                project_anchor: (snippet.project_anchor && snippet.project_anchor !== 'inbox')
                    ? snippet.project_anchor
                    : (result.project_anchor || snippet.project_anchor),
                is_processed: true,
                embedding: embedding // Save vector
            })
            .eq("id", snippetId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error("AI Processing Error:", error);

        // MOCK FALLBACK
        if (snippetId) {
            try {
                // 1. Fetch content for deterministic embedding if current data is stale
                let content = "default content";
                try {
                    const { data } = await supabase.from("snippets").select("content, project_anchor").eq("id", snippetId).single();
                    if (data) {
                        content = data.content;
                    }
                } catch (e) { }

                // 2. Generate Deterministic Embedding based on content
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

                const mockEmbedding = generateMockEmbedding(content);
                const isInternship = content.toLowerCase().includes("finance") || content.toLowerCase().includes("job") || content.toLowerCase().includes("intern");
                const anchor = isInternship ? "intern" : "academic";

                // Note: We use 'is_processed: true' so UI stops spinning. 
                // We add [Error] or [Mock] prefix to summary so user knows what happened.
                await supabase.from("snippets").update({
                    summary: `[Mock/Error] Processed: ${error.message} - ${content.substring(0, 50)}...`,
                    ai_tags: ["#ErrorFallback", "#" + anchor],
                    project_anchor: (snippet.project_anchor && snippet.project_anchor !== 'inbox')
                        ? snippet.project_anchor
                        : anchor,
                    is_processed: true,
                    embedding: mockEmbedding
                }).eq("id", snippetId);

                return NextResponse.json({ success: true, is_mock: true, error: error.message });
            } catch (fallbackError) {
                console.error("Even fallback failed:", fallbackError);
            }
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
