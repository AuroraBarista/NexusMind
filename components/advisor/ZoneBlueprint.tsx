
import { Sparkles } from "lucide-react";

interface ZoneBlueprintProps {
    plan: any; // Using any for flexibility or reuse strict type
}

export function ZoneBlueprint({ plan }: ZoneBlueprintProps) {
    if (!plan) return null;

    return (
        <div className="p-6 rounded-2xl bg-[#0a0f1c] border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Strategic Blueprint</h3>
                        <h2 className="text-xl font-display text-white mt-1">{plan.project_title || "Execution Plan"}</h2>
                    </div>
                </div>
                {plan.project_type && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-white/5 text-neutral-400 border border-white/5">
                        {plan.project_type}
                    </span>
                )}
            </div>

            {/* Core Objective & Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Core Objective</h4>
                    <p className="text-sm text-cyan-100/90 font-medium leading-relaxed bg-cyan-950/30 p-4 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.1)]">
                        {plan.core_objective}
                    </p>
                </div>

                {plan.target_audience && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400">Target Audience</h4>
                        <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20 text-sm text-purple-200">
                            🎯 {plan.target_audience}
                        </div>
                    </div>
                )}
            </div>

            {/* Missing Info (Warning) */}
            {plan.missing_info && plan.missing_info.length > 0 && (
                <div className="space-y-2 bg-amber-950/20 p-4 rounded-lg border border-amber-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Missing Intelligence</h4>
                    <div className="flex flex-wrap gap-2">
                        {plan.missing_info.map((info: string, i: number) => (
                            <span key={i} className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-200 text-xs border border-amber-500/20">
                                {info}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Pillars */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Structural Pillars</h4>
                <div className="flex flex-wrap gap-2">
                    {plan.structural_pillars?.map((pillar: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-900/20 text-blue-300 border border-blue-500/20 rounded-full text-xs">
                            {pillar}
                        </span>
                    ))}
                </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-green-400">Execution Roadmap</h4>
                <div className="grid grid-cols-1 gap-y-2 relative">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
                    {plan.roadmap_steps?.map((step: any, i: number) => (
                        <div key={i} className="relative pl-8 group">
                            <div className="absolute left-[9px] top-4 w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-green-500 transition-colors" />
                            <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <div className="flex flex-col min-w-[100px]">
                                    <span className="text-[10px] text-neutral-500 uppercase font-bold">Step {step.step}</span>
                                    {step.phase && <span className="text-[10px] text-neutral-400 uppercase tracking-wider">{step.phase}</span>}
                                </div>
                                <div className="text-sm text-neutral-300 leading-snug">{step.action}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
