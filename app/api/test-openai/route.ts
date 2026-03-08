import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "Missing OPENAI_API_KEY in environment variables." }, { status: 500 });
    }

    try {
        const openai = new OpenAI({ apiKey });

        // Simple test call
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Say 'Connection successful' if you can hear me." }],
            max_tokens: 10,
        });

        return NextResponse.json({
            success: true,
            message: completion.choices[0].message.content,
            model: completion.model
        });

    } catch (error: any) {
        console.error("OpenAI Verification Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            type: error.type
        }, { status: 500 });
    }
}
