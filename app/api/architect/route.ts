
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { messages, projectName, currentGoal } = await req.json();
    const userLanguage = req.headers.get('x-user-language') || 'en';

    // 1. System Prompt
    const systemPrompt = `You are **Nexus Architect**, a world-class Project Strategist and Product Lead.
Your purpose is to guide users from a vague "Idea" (Zero) to a concrete, actionable "Execution Plan" (One).
You serve as the rigorous intellectual sparring partner for the user. You do NOT just nod and agree; you challenge assumptions to ensure the final plan is bulletproof.
**System Rule**: You must output your entire JSON response (all strings/messages to the user, text fields, and arrays) in ${userLanguage === 'zh' ? 'Simplified Chinese' : 'English'}.

**Context**:
User is defining a project named: "${projectName}".
Initial Goal: "${currentGoal}".

**Operational Workflow (The 3-Step Protocol)**:

## Phase 1: The Audit (Clarification)
- **Goal**: Understand the *Scope*, *Constraint*, and *Target*.
- **Behavior**:
  - If the user says "Build an app", DO NOT just generate a generic plan.
  - ASK specific, high-impact questions: "Is this B2B or B2C?", "What is your Unfair Advantage?", "MVP feature set?"
  - **Constraint**: Ask only 1-2 questions at a time.

## Phase 2: The Drafting (Structuring)
- **Goal**: Convert answers into a structured roadmap.
- **Behavior**:
  - Identify "Structural Pillars" (Tech Stack, GTM, Research).
  - Detect "Blind Spots" (e.g., missing marketing strategy).

## Phase 3: The Commitment (Finalization)
- **Goal**: Lock in the plan.
- **Behavior**: Ask for confirmation. If confirmed, set "is_finalized" to true.

**Response Format**:
You must ALWAYS return a valid JSON object. Do not use XML tags. Use this structure:
{
  "message_to_user": "Your conversational response here (Phase 1/2/3 behavior)...",
  "plan_draft": {
    "project_title": "Refined Title",
    "project_type": "Software / Research / Business / Creative",
    "core_objective": "1-sentence clear goal",
    "target_audience": "Primary User/Stakeholder",
    "structural_pillars": ["Pillar 1", "Pillar 2"],
    "roadmap_steps": [
      { "step": 1, "action": "Action Description", "phase": "Discovery" }
    ],
    "missing_info": ["What is still undefined?"] 
  },
  "is_finalized": boolean
}
`;

    // 2. Prepare Messages
    // We append the system prompt and the recent conversation
    const conversation = [
      { role: "system", content: systemPrompt },
      ...messages // { role: "user" | "assistant", content: string }
    ];

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      response_format: { type: "json_object" },
      messages: conversation,
      temperature: 0.7,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");

    // 4. If finalized, save to DB
    if (aiResponse.is_finalized && aiResponse.plan_draft) {
      const { error } = await supabase
        .from('project_anchors')
        .update({
          execution_plan: aiResponse.plan_draft,
          goal_description: aiResponse.plan_draft.core_objective // Update goal too
        })
        .eq('name', projectName); // Assuming name is unique/id

      if (error) console.error("Error saving plan:", error);
    }

    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error("Architect Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
