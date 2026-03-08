import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const snippetId = searchParams.get("id");

        if (!snippetId) {
            return NextResponse.json({ error: "Missing snippetId" }, { status: 400 });
        }

        const { error } = await supabase
            .from("snippets")
            .delete()
            .eq("id", snippetId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
