import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: Request) {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const { project_id, snippet_id } = await req.json();

        if (!project_id || !snippet_id) {
            return NextResponse.json({ error: 'Missing project_id or snippet_id' }, { status: 400 });
        }

        // 1. Fetch Project Details
        const { data: project } = await supabase.from('project_anchors').select('*').eq('id', project_id).single();
        if (!project) throw new Error("Project not found");

        // 2. Fetch Snippet Details
        const { data: snippet } = await supabase.from('snippets').select('*').eq('id', snippet_id).single();
        if (!snippet) throw new Error("Snippet not found");

        // 3. AI Evaluation for Relevance, Type, and Summary
        const prompt = `
You are an expert Project Assistant classifying a piece of captured evidence.
Project Title: ${project.name}
Project Objective: ${project.objective || project.description || 'Not specified'}
Target Audience: ${project.target_audience || 'Not specified'}

Evidence Content:
"""
${snippet.content}
"""

Instructions:
Evaluate how this scattered evidence helps the project.
Output strict JSON with:
1. "relevance_score": An integer (0-100) representing how directly useful this is to the project's objective.
2. "type": Must be exactly one of: 'Research', 'Idea', 'Technical', 'Market', 'Prototype', or 'Other'.
3. "summary": A highly descriptive, detailed but concise summary (2-4 sentences max) explaining EXACTLY what this evidence is.
4. "contribution": A short, explicit sentence starting with a verb (e.g. "Supports user research", "Validates technical feasibility") that explains HOW this evidence pushes the project forward.
5. "insight": A deep, non-obvious deduction derived from this evidence that answers "so what?" (1 sentence max).
6. "decision_impact": The explicit project decision this evidence supports or forces (e.g. "Use SwiftUI for MVP", "Pivot target audience to students") (1 short sentence).

Output strict JSON:
{
  "relevance_score": integer,
  "type": "string",
  "summary": "string",
  "contribution": "string",
  "insight": "string",
  "decision_impact": "string"
}
`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const responseText = completion.choices[0].message.content || "{}";
        const aiEvaluation = JSON.parse(responseText);

        // 4. Insert into project_evidence
        const { data: newEvidence, error: insertError } = await supabase.from('project_evidence').insert({
            project_id,
            snippet_id,
            type: aiEvaluation.type || 'Other',
            relevance_score: aiEvaluation.relevance_score || 50,
            summary: aiEvaluation.summary || snippet.content.substring(0, 150),
            contribution: aiEvaluation.contribution || "Provides contextual information for the project.",
            insight: aiEvaluation.insight || "Further analysis required to extract core insight.",
            decision_impact: aiEvaluation.decision_impact || "Pending strategic review."
        }).select().single();

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, evidence: newEvidence }, { headers: corsHeaders });

    } catch (e: any) {
        console.error("Evidence Link Error:", e);
        return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500, headers: corsHeaders });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const evidenceId = searchParams.get('id');

        if (!evidenceId) {
            return NextResponse.json({ error: 'Missing evidence id' }, { status: 400 });
        }

        // Check if row exists first
        const { data: checkData } = await supabase.from('project_evidence').select('*').eq('id', evidenceId).single();
        console.log("Delete Pre-check:", evidenceId, "Exists:", !!checkData);

        const { data, error } = await supabase
            .from('project_evidence')
            .delete()
            .eq('id', evidenceId)
            .select();

        console.log("Delete attempt for ID:", evidenceId, "Result data:", data, "Error:", error);

        if (error) throw error;

        if (!data || data.length === 0) {
            console.log("WARNING: Delete succeeded but 0 rows returned, check RLS or if ID is valid.");
        }

        return NextResponse.json({ success: true, deleted: data }, { headers: corsHeaders });
    } catch (e: any) {
        console.error("Evidence Delete Error:", e);
        return NextResponse.json({ error: e.message || 'Unknown delete error', details: e }, { status: 500, headers: corsHeaders });
    }
}
