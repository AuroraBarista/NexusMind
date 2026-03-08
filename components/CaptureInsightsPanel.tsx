"use client";

import { useEffect, useState } from "react";
import { Sparkles, BrainCircuit, Activity, Target, AlertTriangle, AlertCircle, RefreshCw, BarChart2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightData {
    summary: string;
    topic_distribution: Array<{ topic: string, count: number, percentage: number }>;
    topic_trends: string;
    project_opportunities: Array<{ title: string, reason: string }>;
    knowledge_gaps: Array<{ topic: string, description: string }>;
    important_signals: Array<{ description: string }>;
}

export function CaptureInsightsPanel() {
    const [insights, setInsights] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/capture-insights");
            if (!res.ok) {
                throw new Error("Failed to fetch insights");
            }
            const data = await res.json();
            if (data.insights) {
                setInsights(data.insights);
            } else if (data.message) {
                setInsights(null); // Explicitly handle "no unassigned captures" state if needed
                setError(data.message); // Not an error strictly, but shows in UI as message
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    return (
        <div className="absolute inset-0 glass-panel rounded-2xl border border-white/5 shadow-lg shadow-black/20 overflow-hidden flex flex-col bg-black/40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart2 className="text-cyan-400" size={18} />
                    <h3 className="text-sm font-sans tracking-widest text-white/90 uppercase font-medium">AI Insights</h3>
                </div>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="p-1.5 text-white/40 hover:text-cyan-400 transition-colors rounded-md hover:bg-white/5"
                    title="Refresh Insights"
                >
                    <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
                        <BrainCircuit className="text-cyan-400 animate-pulse" size={32} />
                        <p className="text-xs font-mono uppercase tracking-widest text-white/60">Quantifying Capture Data...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4 text-center">
                        <AlertTriangle className="text-yellow-400/50" size={32} />
                        <p className="text-sm text-white/60">{error}</p>
                        <p className="text-[10px] uppercase font-mono text-white/40">Gather more unassigned captures to generate insights.</p>
                    </div>
                ) : insights ? (
                    <>
                        {/* Summary Block */}
                        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-4">
                            <p className="text-sm text-cyan-100/90 font-medium leading-relaxed">
                                {insights.summary}
                            </p>
                        </div>

                        {/* Topic Distribution */}
                        {insights.topic_distribution && insights.topic_distribution.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                                    <Activity size={12} className="text-blue-400" />
                                    Topic Distribution
                                </h4>
                                <div className="space-y-3">
                                    {insights.topic_distribution.map((topic, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/80 font-medium">{topic.topic}</span>
                                                <span className="text-white/50 font-mono">{topic.count} captures ({topic.percentage}%)</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500/50 rounded-full"
                                                    style={{ width: `${topic.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trend */}
                        {insights.topic_trends && (
                            <div>
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                    <TrendingUp size={12} className="text-green-400" />
                                    Trend
                                </h4>
                                <p className="text-xs text-white/60 leading-relaxed pl-2 border-l-2 border-green-500/30">
                                    {insights.topic_trends}
                                </p>
                            </div>
                        )}

                        {/* Project Opportunities */}
                        {insights.project_opportunities && insights.project_opportunities.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                                    <Target size={12} className="text-purple-400" />
                                    Opportunity
                                </h4>
                                <div className="space-y-3">
                                    {insights.project_opportunities.map((opp, i) => (
                                        <div key={i} className="group p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                                            <h5 className="text-sm font-medium text-purple-100/90 mb-1">Possible project: {opp.title}</h5>
                                            <p className="text-[11px] text-purple-200/50 font-light leading-relaxed">
                                                {opp.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Knowledge Gaps */}
                        {insights.knowledge_gaps && insights.knowledge_gaps.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                                    <AlertCircle size={12} className="text-orange-400" />
                                    Knowledge Gap
                                </h4>
                                <div className="space-y-3">
                                    {insights.knowledge_gaps.map((gap, i) => (
                                        <div key={i} className="p-3.5 rounded-xl bg-orange-900/10 border border-orange-500/20">
                                            <span className="text-xs font-medium text-orange-200/80 mb-1 block">{gap.topic}</span>
                                            <p className="text-[11px] text-orange-200/50 font-light leading-relaxed">
                                                {gap.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Important Signals */}
                        {insights.important_signals && insights.important_signals.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                                    <Sparkles size={12} className="text-yellow-400" />
                                    Important Signals
                                </h4>
                                <div className="space-y-2">
                                    {insights.important_signals.map((sig, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-yellow-100/70 p-2 rounded-lg bg-yellow-500/5">
                                            <span className="mt-0.5">•</span>
                                            <p className="leading-relaxed">{sig.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </>
                ) : null}
            </div>
        </div>
    );
}
