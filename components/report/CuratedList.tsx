"use client";

import { TrendingUp, ArrowUpRight, Zap } from "lucide-react";

interface CuratedItem {
    rank: number;
    title: string;
    core_insight: string;
    action_suggestion?: string; // New field
    relevance_score: number;
    entropy_score: number;
    tag: string;
}

interface CuratedListProps {
    items: CuratedItem[];
    filter: string | null;
}

export function CuratedList({ items, filter }: CuratedListProps) {
    if (!items || items.length === 0) return (
        <p className="text-sm text-neutral-400 italic">No curated items found.</p>
    );

    // Filter Logic
    const filteredItems = filter
        ? items.filter(item => item.tag === filter || item.title.includes(filter)) // Simple match for now
        : items;

    if (filteredItems.length === 0) return (
        <div className="p-8 text-center border border-dashed border-neutral-200 rounded-xl">
            <p className="text-sm text-neutral-400">No items match this filter.</p>
            <button onClick={() => { }} className="text-xs text-neutral-800 underline mt-2">Clear Filter</button>
        </div>
    );

    return (
        <div className="space-y-8">
            {filteredItems.map((item, i) => {
                // Mock Action if missing
                const action = item.action_suggestion || `Deep dive into ${item.title.split(' ').slice(0, 2).join(' ')} trends.`;

                return (
                    <div key={i} className="group relative pl-8 border-l border-neutral-200 hover:border-black transition-colors duration-300">
                        {/* Rank Badge */}
                        <span className="absolute -left-[5px] top-0 text-[10px] font-mono font-bold text-neutral-300 group-hover:text-black group-hover:bg-black group-hover:text-white transition-all bg-[#F5F5F7] py-1 px-1 rounded-sm">
                            {item.rank.toString().padStart(2, '0')}
                        </span>

                        {/* Title & Meta */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                            <h4 className="text-lg font-bold text-neutral-900 leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-neutral-400 transition-all">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 bg-neutral-100 text-[9px] uppercase tracking-wide font-bold text-neutral-600 rounded-full border border-neutral-200">
                                    {item.tag}
                                </span>
                            </div>
                        </div>

                        {/* Core Insight */}
                        <p className="text-sm text-neutral-600 font-serif mb-4 leading-relaxed group-hover:text-neutral-900 transition-colors">
                            {item.core_insight}
                        </p>

                        {/* Action Suggestion */}
                        <div className="flex items-start gap-3 p-3 bg-white border border-neutral-100 rounded-lg shadow-sm group-hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] transition-all transform group-hover:-translate-y-0.5">
                            <div className="p-1 bg-yellow-400/10 rounded-md text-yellow-600 mt-0.5">
                                <Zap size={14} fill="currentColor" className="opacity-80" />
                            </div>
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-0.5">Recommended Action</h5>
                                <p className="text-xs font-medium text-neutral-800">
                                    {action}
                                </p>
                            </div>
                            <ArrowUpRight size={14} className="ml-auto text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
