
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { name, goal, fileUrl, fileName } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        // 1. Text Extraction (Simulated for now, or simple fetch if text)
        let extractedText = "";
        let requirementsDoc = null;

        if (fileUrl) {
            try {
                // Fetch the file content
                const fileRes = await fetch(fileUrl);
                if (fileRes.ok) {
                    const blob = await fileRes.blob();

                    // Simple text extraction for .txt or .md. 
                    // For PDF/DOCX, in a real app we'd use a parsing library or service.
                    // Here, we'll try to get text if possible, or just store metadata.
                    if (fileName?.endsWith('.txt') || fileName?.endsWith('.md')) {
                        extractedText = await blob.text();
                    } else {
                        extractedText = "[Binary File - Extraction requires OCR/PDF service]";
                    }
                }

                requirementsDoc = {
                    file_name: fileName,
                    file_url: fileUrl,
                    extracted_text: extractedText
                };
            } catch (e) {
                console.error("Extraction Failed:", e);
                // Continue without failing the whole request
            }
        }

        // 2. Insert Project
        // We use 'upsert' or 'insert'. If name is unique, insert.
        const { data, error } = await supabase.from('project_anchors').insert([{
            name: name,
            goal_description: goal,
            requirements_doc: requirementsDoc,
            color: '#06b6d4', // Default Cyan
            description: goal || 'User initiated project'
        }]).select().single();

        if (error) {
            // Handle duplicate name error gracefully?
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: "Project name already exists" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true, project: data });

    } catch (error: any) {
        console.error("Create Project API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
