
const OpenAI = require("openai");

// Read from env (simulating how Next.js loads it)
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error("❌ No OPENAI_API_KEY found in environment!");
    process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function verifyOpenAI() {
    console.log("Found API Key:", apiKey.substring(0, 8) + "...");
    console.log("Testing OpenAI Connection (gpt-4o-mini)...");

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello, are you working?" }],
            max_tokens: 10,
        });

        console.log("✅ Success! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ OpenAI API Failed:", error.message);
    }
}

verifyOpenAI();
