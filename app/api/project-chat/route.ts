import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { project_id, messages } = await req.json();

        if (!project_id || !messages) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch Project Data
        const { data: project, error: pError } = await supabase
            .from('project_anchors')
            .select('*')
            .eq('id', project_id)
            .single();

        if (pError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Fetch Explicitly Linked Evidence
        const { data: evidence, error: eError } = await supabase
            .from('project_evidence')
            .select(`
                type,
                relevance_score,
                summary,
                snippet:snippets(content)
            `)
            .eq('project_id', project_id);

        if (eError) {
            throw new Error('Failed to fetch evidence');
        }

        const formattedEvidence = evidence.map((e: any) => ({
            type: e.type,
            content: e.snippet?.content || e.summary
        }));

        const systemMessage = {
            role: "system",
            content: `You are the "AI Architect" for NexusMind, an expert assistant dedicated solely to the success of the current active project.
            
You MUST NOT reference or acknowledge any user data or generic web knowledge unless it is directly pertinent to the context provided below. Be concise, act as a strategic partner, and help the user refine their objective, identify missing evidence, or plan the roadmap.

PROJECT DETAILS:
Title: ${project.name}
Core Objective: ${project.objective || 'Not defined yet.'}
Target Audience: ${project.target_audience || 'Not defined yet.'}

ROADMAP STATUS:
${JSON.stringify(project.roadmap || [], null, 2)}

LINKED EVIDENCE DATA (Your single source of truth for user notes):
${JSON.stringify(formattedEvidence, null, 2)}

If the user asks about something not in the Evidence Data, tell them they need to capture or link evidence to the project first.`
        };

        // Tool Definition
        const updateProjectTool = {
            type: "function" as const,
            function: {
                name: "update_project_details",
                description: "Update the core details of the current active project based on instructions from the user. Only use this if the user explicitly asks to update their project's objective, target audience, or roadmap. Do not use this just to answer questions.",
                parameters: {
                    type: "object",
                    properties: {
                        objective: { type: "string", description: "The new core objective or goal of the project." },
                        target_audience: { type: "string", description: "The new intended demographic or target audience for the project." },
                        roadmap: {
                            type: "array",
                            description: "The updated roadmap steps.",
                            items: {
                                type: "object",
                                properties: {
                                    step: { type: "string", description: "Name of the milestone or phase." },
                                    status: { type: "string", enum: ["pending", "active", "completed"] }
                                },
                                required: ["step", "status"]
                            }
                        }
                    }
                }
            }
        };

        let apiMessages: any[] = [systemMessage, ...messages];
        let projectUpdated = false;

        // Perform First OpenAI Call
        let completion = await openai.chat.completions.create({
            model: "gpt-5.4-mini",
            messages: apiMessages,
            tools: [updateProjectTool],
            tool_choice: "auto",
            temperature: 0.7,
            max_completion_tokens: 500,
        });

        const responseMessage = completion.choices[0].message;

        // Handle Tool Calls if the AI decided to update the project
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            apiMessages.push(responseMessage); // Add the assistant's tool_call message history

            for (const toolCall of responseMessage.tool_calls) {
                if (toolCall.type === 'function' && toolCall.function.name === "update_project_details") {
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const updates: any = {};

                        if (args.objective) updates.objective = args.objective;
                        if (args.target_audience) updates.target_audience = args.target_audience;
                        if (args.roadmap) updates.roadmap = args.roadmap;

                        if (Object.keys(updates).length > 0) {
                            const { error: updateError } = await supabase
                                .from('project_anchors')
                                .update(updates)
                                .eq('id', project_id);

                            if (updateError) throw updateError;
                            projectUpdated = true;

                            apiMessages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                name: toolCall.function.name,
                                content: JSON.stringify({ success: true, message: "Project updated successfully in the database." })
                            });
                        } else {
                            apiMessages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                name: toolCall.function.name,
                                content: JSON.stringify({ error: "No valid fields were provided to update." })
                            });
                        }
                    } catch (e: any) {
                        console.error("Tool execution error:", e);
                        apiMessages.push({
                            role: "tool",
                            tool_call_id: toolCall.id,
                            name: toolCall.function.name,
                            content: JSON.stringify({ error: "Database update failed: " + e.message })
                        });
                    }
                }
            }

            // Perform Second OpenAI Call with the tool results so it can naturally reply to the user
            completion = await openai.chat.completions.create({
                model: "gpt-5.4-mini",
                messages: apiMessages,
                temperature: 0.7,
                max_completion_tokens: 500,
            });
        }

        const replyContent = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({ reply: replyContent, projectUpdated });
    } catch (e: any) {
        console.error("Project Chat execution failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
