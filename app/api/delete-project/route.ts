
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        const { projectName } = await req.json();

        if (!projectName) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        // Delete from project_anchors
        const { error } = await supabase
            .from('project_anchors')
            .delete()
            .eq('name', projectName);

        if (error) throw error;

        // Optionally delete from legacy 'projects' table if it exists there too
        // We do this just in case to keep things clean
        await supabase
            .from('projects')
            .delete()
            .eq('name', projectName);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete Project Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
