
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai'; // Unused here for now, or use if we want to re-summarize requirements immediately

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { projectName, goal, fileUrl, fileName, removeFile, execution_plan } = await req.json();

        if (!projectName) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        // Prepare updates
        const updates: any = {};
        if (goal) updates.goal_description = goal;
        if (execution_plan) updates.execution_plan = execution_plan;

        // If removing file
        if (removeFile) {
            updates.requirements_doc = null;
        }

        // If new file provided
        if (fileUrl) {
            // Basic Structure for now, similar to create-project
            // In real app, we might want to extract text here using generic-extract or similar
            // For now, we store the reference
            updates.requirements_doc = {
                file_url: fileUrl,
                file_name: fileName,
                extracted_text: "Text extraction pending..." // We could trigger extraction separately
            };
        }

        const { error } = await supabase
            .from('project_anchors')
            .update(updates)
            .eq('name', projectName); // Using name as ID per current schema design

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Update Project Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
