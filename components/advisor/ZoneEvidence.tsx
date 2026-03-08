import { useState } from "react";
import { Zap, Network, ChevronDown, ChevronRight, CheckCircle2, Info, AlertTriangle, Lightbulb, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "Core Evidence" | "Context" | "Contradiction" | "Inspiration" | "Noise";

export interface EvidenceItem {
    snippet_id: string;
    title: string;
    role: RoleType;
    connection_to: string[];
    insight: string;
}

export interface ZoneEvidenceProps {
    items: EvidenceItem[];
    narrative?: string;
}

const ROLE_CONFIG: Record<RoleType, { bg: string, border: string, text: string, icon: React.ReactNode }> = {
    "Core Evidence": { bg: "bg-green-900/10", border: "border-green-500/30", text: "text-green-400", icon: <CheckCircle2 size={16} /> },
    "Context": { bg: "bg-blue-900/10", border: "border-blue-500/30", text: "text-blue-400", icon: <Info size={16} /> },
    "Contradiction": { bg: "bg-red-900/10", border: "border-red-500/30", text: "text-red-400", icon: <AlertTriangle size={16} /> },
    "Inspiration": { bg: "bg-yellow-900/10", border: "border-yellow-500/30", text: "text-yellow-400", icon: <Lightbulb size={16} /> },
    "Noise": { bg: "bg-neutral-900/30", border: "border-neutral-500/30", text: "text-neutral-400", icon: <Ghost size={16} /> },
};

export function ZoneEvidence({ items, narrative }: ZoneEvidenceProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedItem(prev => prev === id ? null : id);
    };

    if (!items || items.length === 0) return null;

    // Optional: Sort items so Core Evidence usually appears near the top
    const sortedItems = [...items].sort((a, b) => {
        const order = ["Core Evidence", "Contradiction", "Inspiration", "Context", "Noise"];
        return order.indexOf(a.role) - order.indexOf(b.role);
    });

    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md">

            <h3 className="text-xs font-display font-medium text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Network size={14} className="text-cyan-400" /> Evidence Library
            </h3>

            {/* AI Narrative Synthesis */}
            {narrative && (
                <div className="mb-6 p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
                    <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded bg-purple-500/20 text-purple-300 mt-0.5 shrink-0">
                            <Zap size={14} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wide mb-1">Synthesized Narrative</h4>
                            <p className="text-sm text-purple-100/90 leading-relaxed font-medium">
                                {narrative}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Evidence List */}
            <div className="space-y-3">
                {sortedItems.map((item) => {
                    const isExpanded = expandedItem === item.snippet_id;
                    const config = ROLE_CONFIG[item.role] || ROLE_CONFIG.Noise;

                    return (
                        <div
                            key={item.snippet_id}
                            className={cn(
                                "rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer",
                                config.bg,
                                config.border,
                                isExpanded ? "shadow-lg shadow-black/50 ring-1 ring-white/10" : "hover:border-white/20"
                            )}
                            onClick={() => toggleExpand(item.snippet_id)}
                        >
                            {/* Card Header (Always Visible) */}
                            <div className="p-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={cn("p-2 rounded-lg shrink-0", `bg-black/30 ${config.text}`)}>
                                        {config.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                                        <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", config.text)}>
                                            {item.role}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-neutral-500 shrink-0">
                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </div>
                            </div>

                            {/* Card Details (Collapsible) */}
                            {isExpanded && (
                                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="pt-3 border-t border-white/5 space-y-3">

                                        <div>
                                            <h5 className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1">AI Insight & Value</h5>
                                            <p className="text-sm text-neutral-300 leading-relaxed">
                                                {item.insight}
                                            </p>
                                        </div>

                                        {item.connection_to && item.connection_to.length > 0 && (
                                            <div>
                                                <h5 className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                                    <Network size={10} /> Connects To
                                                </h5>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {item.connection_to.map(targetId => {
                                                        const targetItem = items.find(i => i.snippet_id === targetId);
                                                        if (!targetItem) return null;
                                                        return (
                                                            <span key={targetId} className="px-2 py-1 rounded bg-black/40 border border-white/5 text-xs text-neutral-400 truncate max-w-[200px]" title={targetItem.title}>
                                                                {targetItem.title}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
