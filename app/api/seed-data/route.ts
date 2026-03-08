
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Wipe existing data
    const { error: deleteError } = await supabase
        .from("snippets")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (deleteError) {
        return NextResponse.json({ error: "Failed to wipe data: " + deleteError.message }, { status: 500 });
    }

    // 2. High-Res Sample Data (3D Summary + Hard-Core Tags)
    const sampleData = [
        // ACADEMIC (Blue)
        {
            content: "Understanding Transformer Architecture: Attention mechanisms are key. Connects encoder and decoder stacks.",
            project_anchor: "academic",
            summary: "[Fact] Transformer replaces RNNs with Self-Attention mechanism. [Relevance] Foundation of modern LLMs (GPT/BERT). [Action] Implement 'Multi-Head Attention' from scratch in PyTorch.",
            ai_tags: ["#TransformerArch", "#SelfAttention", "#EncoderDecoder", "#PyTorch"],
            is_processed: true
        },
        {
            content: "Backpropagation Algorithm derivation notes. Chain rule application in neural networks.",
            project_anchor: "academic",
            summary: "[Fact] Backprop calculates gradients via Chain Rule. [Relevance] Essential for optimizing Neural Net weights. [Action] Derive gradients for a 2-layer MLP manually.",
            ai_tags: ["#Backpropagation", "#ChainRule", "#GradientDescent", "#ComputationalGraph"],
            is_processed: true
        },
        {
            content: "React useEffect hook dependency array pitfalls. Infinite loops if not careful.",
            project_anchor: "academic",
            summary: "[Fact] useEffect dependency array controls re-execution. [Relevance] Misuse causes infinite loops or stale closures. [Action] Use ESLint plugin to autofix dependency arrays.",
            ai_tags: ["#ReactHooks", "#StaleClosures", "#DependencyGraph", "#RenderCycle"],
            is_processed: true
        },

        // INTERN (Green)
        {
            content: "Meeting notes: Deployment pipeline failed due to AWS permission error. Need IAM role update.",
            project_anchor: "intern",
            summary: "[Fact] CI/CD pipeline halted by IAM Policy denial. [Relevance] Blocks production deployment. [Action] Attach 'CodeDeployRole' to the EC2 instance profile.",
            ai_tags: ["#IAMPolicy", "#CICDPipeline", "#AWS_EC2", "#RoleBasedAccess"],
            is_processed: true
        },
        {
            content: "Refactoring legacy API endpoints. Switching from REST to GraphQL for better data fetching efficiency.",
            project_anchor: "intern",
            summary: "[Fact] GraphQL eliminates Over-fetching present in REST. [Relevance] Reduces mobile data usage by 40%. [Action] Define Schema Definition Language (SDL) for User profile.",
            ai_tags: ["#GraphQLSchema", "#Overfetching", "#APILatency", "#DataGraph"],
            is_processed: true
        },
        {
            content: "Behavioral interview prep: 'Tell me about a time you failed'. STAR method.",
            project_anchor: "intern",
            summary: "[Fact] STAR method structues behavioral answers. [Relevance] Crucial for FAANG leadership principles. [Action] Draft 'Migration Failure' story using Situation/Task/Action/Result.",
            ai_tags: ["#STARMethod", "#BehavioralInterview", "#LeadershipPrinciples", "#SoftSkills"],
            is_processed: true
        }
    ];

    const { data, error } = await supabase.from("snippets").insert(sampleData).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: data.length });
}
