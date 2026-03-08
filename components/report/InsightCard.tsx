"use client";

import { BrainCircuit, ArrowRight, ExternalLink } from "lucide-react";

interface InsightCardProps {
    source: string;
    target: string;
    description: string;
}

export function InsightCard({ source, target, description }: InsightCardProps) {
    return (
        <div className="relative overflow-hidden group p-6 rounded-2xl bg-gradient-to-br from-white to-blue-50/50 border border-neutral-100 hover:border-blue-100 shadow-sm hover:shadow-[0_4px_20px_-5px_rgba(59,130,246,0.1)] transition-all duration-500">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit size={48} className="text-blue-500" />
            </div>

            {/* Connection Visualizer */}
            <div className="flex items-center gap-3 mb-4 text-[11px] font-mono font-bold uppercase tracking-wide text-neutral-400">
                <span className="px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-600 group-hover:text-blue-600 transition-colors">
                    {source}
                </span>
                <ArrowRight size={12} className="text-neutral-300 group-hover:text-blue-400 transition-colors duration-500" />
                <span className="px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-600 group-hover:text-purple-600 transition-colors">
                    {target}
                </span>
            </div>

            {/* Insight Text */}
            <p className="text-sm font-serif text-neutral-700 leading-relaxed mb-4 group-hover:text-neutral-900 transition-colors">
                {description}
            </p>

            {/* Action Hint */}
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-500 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <span>Explore Connection</span>
                <ExternalLink size={10} />
            </div>
        </div>
    );
}
