import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// CORS Headers helper
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Allow all for extension (or restrict to extension ID later)
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { content, url, image, type = "text", project_anchor = "", user_id = null } = body;

        if (!content && !url && !image) {
            return NextResponse.json(
                { error: "Content, URL, or Image is required" },
                { status: 400, headers: corsHeaders }
            );
        }

        let finalContent = content;
        let fileUrl = null;
        let snippetType = type;

        // Handle Image Upload
        if (image) {
            const base64Data = image.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `screenshot_${Date.now()}.png`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, buffer, {
                    contentType: 'image/png',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
            fileUrl = publicUrlData.publicUrl;
            snippetType = 'image';
        }

        if (url && content !== url && !image) {
            finalContent = `[WEB_CAPTURE] ${content}\nURL: ${url}`;
        } else if (!content && url && !image) {
            finalContent = `[WEB_CAPTURE] Web Resource\nURL: ${url}`;
        }

        // 1. Insert into Supabase Snippets
        const { data: insertedData, error: insertError } = await supabase
            .from("snippets")
            .insert([
                {
                    content: finalContent,
                    type: snippetType,
                    project_anchor: project_anchor,
                    file_url: fileUrl,
                    is_processed: false,
                    user_id: user_id // Assign user if provided
                },
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        // 3. Trigger AI Processing
        const baseUrl = request.url.split("/api/")[0];
        fetch(`${baseUrl}/api/process-brain`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ snippetId: insertedData.id }),
        }).catch(err => console.error("Trigger AI Error:", err));

        return NextResponse.json(
            { success: true, id: insertedData.id },
            { headers: corsHeaders }
        );

    } catch (error: any) {
        console.error("Ext Capture Error:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
