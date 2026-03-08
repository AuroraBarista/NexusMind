
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('project_anchors')
            .select('name, color')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ projects: data }, { headers: corsHeaders });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
