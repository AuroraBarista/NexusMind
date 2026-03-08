"use client";

import { AlertCircle, ArrowRight, BrainCircuit, Play, Sparkles } from "lucide-react";

export function DailyBriefing() {
    return (
        <div className="absolute inset-0 glass-panel rounded-2xl border border-white/5 shadow-lg shadow-black/20 overflow-hidden flex flex-col bg-black/40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <BrainCircuit className="text-cyan-400" size={18} />
                <h3 className="text-sm font-sans tracking-widest text-white/90 uppercase font-medium">Daily Briefing</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8">

                {/* Section 1: Projects Needing Attention */}
                <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                        <AlertCircle size={12} className="text-orange-400" />
                        Requires Attention
                    </h4>

                    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <h5 className="text-sm font-medium text-white/90">AI News App</h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Stalled</span>
                        </div>
                        <p className="text-xs text-white/50 font-light line-clamp-2">
                            No new evidence added in 3 days. Ready for next execution phase.
                        </p>
                    </div>
                </div>

                {/* Section 2: Suggested Next Actions */}
                <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                        <Play size={12} className="text-cyan-400" />
                        Next Actions
                    </h4>

                    <div className="space-y-3">
                        <div className="group p-4 rounded-xl bg-gradient-to-br from-cyan-900/10 to-transparent border border-cyan-500/20 hover:bg-cyan-900/20 transition-all cursor-pointer flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5"><Sparkles size={14} className="text-cyan-400" /></div>
                                <div>
                                    <p className="text-sm text-cyan-100/90 font-medium">Design onboarding screen</p>
                                    <p className="text-[10px] text-cyan-500/60 uppercase font-mono mt-1">Project: AI News App</p>
                                </div>
                            </div>
                            <ArrowRight size={14} className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Knowledge Gaps */}
                <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                        <Sparkles size={12} className="text-purple-400" />
                        Knowledge Gaps
                    </h4>

                    <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
                        <p className="text-sm text-purple-100/80 mb-3">
                            You're researching iOS architecture but lack specifics on concurrency.
                        </p>
                        <button className="text-xs text-purple-300 font-medium tracking-wide hover:text-purple-200 transition-colors flex items-center gap-1">
                            Recommended: Swift Concurrency Tutorial <ArrowRight size={12} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
