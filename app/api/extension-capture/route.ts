
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function getCorsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, content, url, title, project_anchor = "", user_id = null } = body;

        // Construct formatting based on type
        let finalContent = content;
        if (type === 'page') {
            finalContent = `[WEB_CAPTURE] ${title}\nURL: ${url}\n\n${content}`;
        } else if (type === 'selection') {
            finalContent = `[SELECTION] from ${title}\n\n"${content}"`;
        } else if (type === 'image') {
            // Handle image url if passed
            finalContent = `[IMAGE_CAPTURE] ${title}\nSource: ${url}`;
        }

        const { data, error } = await supabase
            .from('snippets')
            .insert([{
                content: finalContent,
                project_anchor: project_anchor || 'academic', // Pass anchor or default
                status: 'processing',
                is_processed: false,
                user_id: user_id
            }])
            .select()
            .single();

        // Trigger AI processing (optional, async)
        // fetch('http://localhost:3000/api/process-brain', ...);

        return NextResponse.json({ success: true, id: data.id }, { headers: getCorsHeaders() });

    } catch (error) {
        console.error('Extension capture error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to capture' },
            { status: 500, headers: getCorsHeaders() }
        );
    }
}
