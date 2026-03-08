import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Initialize Clients
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// SMART DATASET
// SMART DATASET (Chinese University Life)
const SMART_DATA = [
    // CLUSTER A: Leaning & AI (Academic)
    {
        content: "期末微积分复习：重点复习泰勒展开式和二重积分，格林公式必考。",
        project_anchor: "academic",
        summary: "[Fact] 泰勒展开用于函数逼近。 [Relevance] 期末考试压轴题常客。 [Action] 刷《吉米多维奇》第三章习题。",
        ai_tags: ["#期末复习", "#微积分", "#数学"]
    },
    {
        content: "深度体验了 DeepSeek-R1 模型，它的思维链 (CoT) 推理能力在写代码方面比 GPT-4 还要快。",
        project_anchor: "academic",
        summary: "[Fact] DeepSeek-R1 擅长长逻辑推理。 [Relevance] 适合辅助写 Python 爬虫。 [Action] 尝试用它重构我的课设代码。",
        ai_tags: ["#DeepSeek", "#AI", "#LLM", "#代码助手"]
    },
    {
        content: "Cursor 编辑器太好用了，特别是 Composer 功能，直接能生成整个项目的文件结构。",
        project_anchor: "academic",
        summary: "[Fact] Cursor Composer 支持多文件编辑。 [Relevance] 极大提升全栈开发效率。 [Action] 学习 Cursor 的快捷键操作。",
        ai_tags: ["#Cursor", "#编程工具", "#效率"]
    },
    {
        content: "图书馆自习：把《统计学习方法》的 SVM 章节看完了，核函数的推导还是有点晕。",
        project_anchor: "academic",
        summary: "[Fact] SVM 利用核技巧处理非线性分类。 [Relevance] 机器学习面试高频考点。 [Action] 手推一遍 SMO 算法。",
        ai_tags: ["#机器学习", "#SVM", "#统计学习"]
    },

    // CLUSTER B: Career & Finance (Internship/Money)
    {
        content: "A股今天白酒板块大跌，我的基金又亏了5个点，到底是加仓还是割肉？",
        project_anchor: "internship", // Mapping 'Money/Career' here
        summary: "[Fact] 消费板块受市场情绪影响回调。 [Relevance] 影响短期理财收益。 [Action] 定投不动，卧倒装死。",
        ai_tags: ["#A股", "#理财", "#基金", "#投资"]
    },
    {
        content: "腾讯暑期实习一面复盘：被问了 TCP三次握手和红黑树，回答得支支吾吾。",
        project_anchor: "internship",
        summary: "[Fact] 计算机网络和数据结构是面试基石。 [Relevance] 决定能否拿到大厂 Offer。 [Action] 背诵《代码随想录》八股文。",
        ai_tags: ["#找工作", "#面试", "#腾讯", "#算法"]
    },
    {
        content: "美股英伟达 (NVDA) 财报分析：数据中心业务暴涨，AI 算力铲子股逻辑没变。",
        project_anchor: "internship",
        summary: "[Fact] AI 基础设施需求持续高增长。 [Relevance] 科技股投资核心逻辑。 [Action] 关注下一次财报会议。",
        ai_tags: ["#美股", "#英伟达", "#AI投资", "#股票"]
    },

    // CLUSTER C: Life & Travel (Social)
    {
        content: "寒假想去哈尔滨旅游，想去冰雪大世界看冰雕，顺便去中央大街吃马迭尔冰棍。",
        project_anchor: "social",
        summary: "[Fact] 哈尔滨是冬季热门旅游地。 [Relevance] 适合放松心情。 [Action] 提前一个月订机票和民宿。",
        ai_tags: ["#旅游", "#哈尔滨", "#旅行计划"]
    },
    {
        content: "社团开会：讨论下个月的电竞比赛策划案，得拉外联赞助了。",
        project_anchor: "social",
        summary: "[Fact] 举办校园活动需要资金支持。 [Relevance] 锻炼沟通和组织能力。 [Action] 写一份给瑞幸咖啡的赞助策划书。",
        ai_tags: ["#社团活动", "#策划", "#电竞"]
    },
    {
        content: "周末跟室友去吃海底捞，现在的服务感觉不如以前了，但是番茄锅还是永远的神。",
        project_anchor: "social",
        summary: "[Fact] 海底捞服务体验下滑。 [Relevance] 影响聚餐选择。 [Action] 下次尝试去吃潮汕牛肉火锅。",
        ai_tags: ["#生活", "#美食", "#火锅"]
    }
];

export async function POST() {
    try {
        // 1. Wipe Data
        const { error: deleteError } = await supabase
            .from("snippets")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (deleteError) throw deleteError;

        console.log("Database wiped. Starting smart seed...");

        // 2. Generate Embeddings & Insert
        const processedData = [];

        for (const item of SMART_DATA) {
            // Combine for embedding
            const textToEmbed = `${item.content} ${item.summary} ${item.ai_tags.join(" ")}`;

            let embedding;
            try {
                // Call OpenAI
                const embeddingResp = await openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: textToEmbed,
                    encoding_format: "float",
                });
                embedding = embeddingResp.data[0].embedding;
                console.log(`Generated real embedding for: ${item.content.substring(0, 20)}...`);
            } catch (err) {
                console.warn("OpenAI failed, using mock embedding for:", item.project_anchor);
                // Mock Embedding Strategy:
                // Academic: [0.05, 0.05, ...]
                // Internship: [-0.05, -0.05, ...]
                // Social: [0.05, -0.05, ...]
                // This ensures high similarity within groups, low between groups.
                const val = item.project_anchor === 'academic' ? 0.05 :
                    item.project_anchor === 'internship' ? -0.05 : 0.02;

                embedding = Array(1536).fill(val);
                // Add some noise so they aren't IDENTICAL (which might look weird)
                embedding[0] += Math.random() * 0.01;
            }

            processedData.push({
                ...item,
                embedding: embedding,
                is_processed: true
            });
        }

        // 3. Insert into DB
        const { data, error: insertError } = await supabase
            .from("snippets")
            .insert(processedData)
            .select();

        if (insertError) throw insertError;

        return NextResponse.json({
            success: true,
            message: `Seeded ${processedData.length} smart nodes.`,
            data
        });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
