import { AlertCircle, Search, ExternalLink } from "lucide-react";

interface Gap {
    gap_id: number;
    description: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    search_query?: string;
}

interface ZoneGapAnalysisProps {
    gaps: Gap[];
}

export function ZoneGapAnalysis({ gaps }: ZoneGapAnalysisProps) {
    if (!gaps || gaps.length === 0) return null;

    const handleAutoSearch = (query: string) => {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md">
            <h3 className="text-xs font-display font-medium text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle size={14} className="text-orange-400" /> Knowledge Gaps & Recommended Searches
            </h3>

            <div className="space-y-4">
                {gaps.map((gap, i) => (
                    <div key={i} className="group flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 relative overflow-hidden">
                        {/* Priority Indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${gap.severity === "HIGH" ? "bg-red-500" :
                            gap.severity === "MEDIUM" ? "bg-orange-400" : "bg-blue-400"
                            }`} />

                        <div className="flex-1 ml-2">
                            <p className="text-sm text-white/90 font-medium leading-relaxed mb-2">{gap.description}</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-black/40 ${gap.severity === "HIGH" ? "text-red-400" :
                                    gap.severity === "MEDIUM" ? "text-orange-300" : "text-blue-300"
                                    }`}>
                                    {gap.severity} Priority
                                </span>
                            </div>
                        </div>

                        {gap.search_query && (
                            <button
                                onClick={() => handleAutoSearch(gap.search_query!)}
                                className="shrink-0 flex items-center gap-2 px-3 py-2 bg-black/40 hover:bg-cyan-500/20 text-neutral-400 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 rounded-lg transition-all text-xs font-bold uppercase tracking-wider group-hover:shadow-lg group-hover:shadow-cyan-900/20"
                                title={`Search: ${gap.search_query}`}
                            >
                                <Search size={12} />
                                <span className="hidden sm:inline">Auto-Search</span>
                                <ExternalLink size={10} className="opacity-50" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
