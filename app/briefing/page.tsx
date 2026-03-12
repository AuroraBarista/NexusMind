"use client";

import { useState, useEffect } from "react";
import { SidebarNav } from "../../components/SidebarNav";
import { Coffee, Activity, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, RefreshCw, Loader2, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BriefingData {
    progress_summary: string;
    went_well: string[];
    needs_attention: string[];
    suggested_improvements: string[];
    next_action: {
        action: string;
        reason: string;
    };
}

export default function BriefingPage() {
    const [briefing, setBriefing] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [focusMode, setFocusMode] = useState(false);

    const fetchBriefing = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/daily-briefing');
            const result = await res.json();
            if (result.success) {
                setBriefing(result.data);
            } else {
                setError(result.error || "Failed to generate daily briefing.");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBriefing();
    }, []);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[#03060C] text-neutral-200 font-sans selection:bg-cyan-900/50 py-12 pl-[280px] pr-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

            <SidebarNav />

            <main className="max-w-[1200px] mx-auto relative z-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 md:gap-0 border-b border-white/10 pb-8 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]">
                                <Coffee className="text-cyan-400 w-6 h-6" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight leading-none">
                                Daily Briefing
                            </h1>
                        </div>
                        <p className="text-sm font-light text-white/50 flex items-center gap-3 tracking-wide">
                            <span className="uppercase text-[10px] tracking-widest bg-white/5 px-2 py-1 rounded text-cyan-400 font-medium font-mono">
                                AI Intelligence Report
                            </span>
                            {today}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchBriefing}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/70 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin text-cyan-400" /> : <RefreshCw size={14} />}
                            Refresh Analysis
                        </button>
                    </div>
                </header>

                {error ? (
                    <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-2xl text-red-400 flex items-start gap-4">
                        <AlertTriangle className="shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-red-300">Briefing Generation Failed</h3>
                            <p className="text-sm opacity-80 mt-1">{error}</p>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse rounded-full" />
                            <Loader2 size={40} className="animate-spin text-cyan-400 relative z-10" />
                        </div>
                        <p className="text-sm text-cyan-400/60 font-mono tracking-widest uppercase animate-pulse">
                            Synthesizing Portfolio Momentum...
                        </p>
                    </div>
                ) : briefing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* 1. Progress Summary (Spans 2 columns) */}
                        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-white/10 bg-black/40 shadow-xl relative overflow-hidden group">
                            <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -skew-x-[30deg] translate-x-[-150%] group-hover:animate-hero-shine pointer-events-none" />
                            <h2 className="text-sm font-medium uppercase tracking-widest text-cyan-400 mb-6 flex items-center gap-3">
                                <Activity size={16} /> Progress Summary
                            </h2>
                            <p className="text-lg text-white/90 leading-relaxed font-light">
                                {briefing.progress_summary}
                            </p>
                        </div>

                        {/* 5. Next Action (Prominent Hero block) */}
                        <div className="lg:col-span-1 glass-panel p-8 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/20 to-black/40 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] flex flex-col justify-between relative group overflow-hidden">
                            {/* Subtle animate-in pulse */}
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                            <div className="relative z-10">
                                <h2 className="text-sm font-medium uppercase tracking-widest text-cyan-400 mb-6 flex items-center gap-3">
                                    <ArrowRight size={16} /> Today's Focus Action
                                </h2>
                                <h3 className="text-xl font-medium text-white mb-4 leading-snug">
                                    {briefing.next_action?.action}
                                </h3>
                                <p className="text-sm text-white/60 font-light leading-relaxed">
                                    {briefing.next_action?.reason}
                                </p>
                            </div>
                            <div className="mt-8 pt-4 border-t border-cyan-500/20 relative z-10">
                                <button
                                    onClick={() => setFocusMode(true)}
                                    className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-medium transition-all duration-300 text-sm shadow-[0_0_15px_-5px_cyan] hover:shadow-[0_0_25px_-5px_cyan] flex justify-center items-center gap-2 group-hover:bg-cyan-500/30"
                                >
                                    <Play size={14} className="group-hover:translate-x-0.5 transition-transform" /> Acknowledge & Start
                                </button>
                            </div>
                        </div>

                        {/* 2. What Went Well */}
                        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-emerald-950/10 hover:border-emerald-500/20 transition-colors">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2">
                                <CheckCircle2 size={14} /> What Went Well
                            </h2>
                            <ul className="space-y-4">
                                {briefing.went_well?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-2 shrink-0" />
                                        <p className="text-sm text-emerald-100/80 leading-relaxed font-light">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 3. Needs Attention */}
                        <div className="glass-panel p-6 rounded-2xl border border-rose-500/10 bg-rose-950/10 hover:border-rose-500/20 transition-colors">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-5 flex items-center gap-2">
                                <AlertTriangle size={14} /> Needs Attention
                            </h2>
                            <ul className="space-y-4">
                                {briefing.needs_attention?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-2 shrink-0" />
                                        <p className="text-sm text-rose-100/80 leading-relaxed font-light">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* 4. Suggested Improvements */}
                        <div className="glass-panel p-6 rounded-2xl border border-purple-500/10 bg-purple-950/10 hover:border-purple-500/20 transition-colors">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-5 flex items-center gap-2">
                                <Lightbulb size={14} /> Strategic Improvements
                            </h2>
                            <ul className="space-y-4">
                                {briefing.suggested_improvements?.map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mt-2 shrink-0" />
                                        <p className="text-sm text-purple-100/80 leading-relaxed font-light">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                ) : null}
            </main>

            {/* Focus Mode Overlay */}
            {focusMode && briefing?.next_action && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl px-4 animate-in fade-in duration-500">
                    <div className="absolute top-8 right-8">
                        <button
                            onClick={() => setFocusMode(false)}
                            className="text-white/50 hover:text-white flex items-center gap-2 transition-colors font-mono uppercase tracking-widest text-xs"
                        >
                            <X size={16} /> Exit Focus Mode
                        </button>
                    </div>

                    {/* Ambient Focus Glow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
                    </div>

                    <div className="max-w-3xl w-full text-center relative z-10">
                        <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-full mb-8 border border-cyan-500/20">
                            <Activity className="text-cyan-400" size={24} />
                        </div>
                        <p className="text-cyan-400 font-mono uppercase tracking-widest text-sm mb-6">Deep Work Session Active</p>
                        <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">{briefing.next_action.action}</h2>
                        <p className="text-xl text-white/60 font-light mb-12 max-w-2xl mx-auto leading-relaxed">{briefing.next_action.reason}</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={() => setFocusMode(false)}
                                className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold tracking-wide shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] transition-all flex items-center gap-3 text-lg"
                            >
                                <CheckCircle2 size={24} /> Mark as Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
