"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnchorDistribution {
    name: string;
    percentage: number;
    count: number;
}

interface InteractivePulseProps {
    distribution: AnchorDistribution[];
    onHover: (anchorName: string | null) => void;
    activeFilter: string | null;
}

export function InteractivePulse({ distribution, onHover, activeFilter }: InteractivePulseProps) {
    if (!distribution || distribution.length === 0) return (
        <div className="h-4 w-full bg-neutral-100 rounded animate-pulse" />
    );

    return (
        <div className="space-y-4">
            {/* The Pulse Bar */}
            <div className="flex h-4 w-full rounded-full overflow-hidden bg-neutral-100 cursor-crosshair">
                {distribution.map((d, i) => (
                    <motion.div
                        key={d.name}
                        initial={{ width: 0 }}
                        animate={{ width: `${d.percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                        onMouseEnter={() => onHover(d.name)}
                        onMouseLeave={() => onHover(null)}
                        className={cn(
                            "h-full transition-all duration-300 relative group",
                            activeFilter === d.name ? "bg-cyan-500 brightness-110 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-10 scale-y-110" : "bg-neutral-800 hover:bg-neutral-900",
                        )}
                        style={{
                            opacity: activeFilter && activeFilter !== d.name ? 0.3 : 1 - (i * 0.1) // Fade out others
                        }}
                    >
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] uppercase font-bold tracking-wider rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                            {d.name} ({d.percentage}%)
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend / Filter Indicators */}
            <div className="flex flex-wrap gap-3">
                {distribution.slice(0, 5).map((d, i) => (
                    <button
                        key={d.name}
                        onMouseEnter={() => onHover(d.name)}
                        onMouseLeave={() => onHover(null)}
                        className={cn(
                            "flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider transition-all border border-transparent rounded-full px-2 py-0.5",
                            activeFilter === d.name
                                ? "text-cyan-600 bg-cyan-50 border-cyan-200"
                                : activeFilter
                                    ? "text-neutral-300 opacity-50"
                                    : "text-neutral-500 hover:text-black"
                        )}
                    >
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            activeFilter === d.name ? "bg-cyan-500 animate-pulse" : "bg-neutral-400"
                        )} />
                        {d.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
