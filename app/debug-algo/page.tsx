
"use client";

import { useState } from "react";

export default function DebugAlgoPage() {
    const [textA, setTextA] = useState("");
    const [textB, setTextB] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runComparison = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/debug-similarity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ textA, textB })
            });
            const data = await res.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-12 font-mono">
            <h1 className="text-3xl mb-8 text-blue-400 font-bold border-b border-white/20 pb-4">
                🧬 Nebula Algorithm Debugger
            </h1>

            <div className="grid grid-cols-2 gap-12 mb-8">
                {/* Input A */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl text-green-400">Fragment A</h2>
                    <textarea
                        value={textA}
                        onChange={(e) => setTextA(e.target.value)}
                        placeholder="Enter first text (e.g. 'Travel to LA')"
                        className="w-full h-32 bg-white/10 border border-white/20 rounded p-4 text-white focus:outline-none focus:border-green-500"
                    />
                </div>

                {/* Input B */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-xl text-purple-400">Fragment B</h2>
                    <textarea
                        value={textB}
                        onChange={(e) => setTextB(e.target.value)}
                        placeholder="Enter second text (e.g. 'Finance homework')"
                        className="w-full h-32 bg-white/10 border border-white/20 rounded p-4 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
            </div>

            <div className="flex justify-center mb-12">
                <button
                    onClick={runComparison}
                    disabled={loading || !textA || !textB}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition disabled:opacity-50"
                >
                    {loading ? "Calculating..." : "RUN COMPARISON"}
                </button>
            </div>

            {result && (
                <div className="border border-white/20 rounded-xl p-8 bg-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-xl">Similarity Score</div>
                        <div className={`text-4xl font-bold ${result.similarity > 0.2 ? 'text-green-500' : 'text-red-500'}`}>
                            {result.similarity.toFixed(4)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-8 text-sm text-gray-400">
                        <div>Threshold: 0.2</div>
                        <div>Result: {result.similarity > 0.2 ? "LINKED ✅" : "NOT LINKED ❌"}</div>
                    </div>

                    <div className="mb-8 p-6 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-blue-400 font-bold flex items-center gap-2">
                                🧠 AI Reasoning Analysis
                            </h3>
                            <div className={`px-4 py-1 rounded-full text-sm font-bold border ${result.scale >= 3 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'}`}>
                                Relevance Scale: {result.scale} / 5
                            </div>
                        </div>
                        <p className="text-gray-300 italic leading-relaxed">
                            "{result.reasoning}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-xs">
                        <div className="p-4 bg-black/30 rounded border border-green-500/30">
                            <h3 className="text-green-400 mb-2 font-bold">Analysis A</h3>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(result.analysisA, null, 2)}</pre>
                        </div>
                        <div className="p-4 bg-black/30 rounded border border-purple-500/30">
                            <h3 className="text-purple-400 mb-2 font-bold">Analysis B</h3>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(result.analysisB, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
