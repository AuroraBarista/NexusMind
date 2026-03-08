import { BarChart3, Clock, Layers, Link as LinkIcon } from "lucide-react";

interface SummaryStatsProps {
    totalSnippetCount: number;
    topAnchor?: string;
    mediaDistribution?: {
        web: number;
        text: number;
        image: number;
        file: number;
    };
    anchorDistribution?: { name: string; count: number; percentage: number }[];
    velocity?: number; // e.g. snippets per day
}

export function SummaryStats({
    totalSnippetCount,
    topAnchor = "N/A",
    mediaDistribution = { web: 0, text: 0, image: 0, file: 0 },
    anchorDistribution = [],
    velocity = 0
}: SummaryStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full mb-10 border-b border-white/10 pb-8">
            {/* Stat 1: Total Fragments (Injest Volume) */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Layers size={14} className="text-cyan-400" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Injest Volume</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-light text-white font-display">
                        {totalSnippetCount}
                    </span>
                    <span className="text-xs text-green-400 font-mono bg-green-400/10 px-1.5 py-0.5 rounded">
                        {velocity > 0 ? `+${velocity}` : '-'}
                    </span>
                </div>
            </div>

            {/* Stat 2: Anchor Breakdown (Distribution) */}
            <div className="col-span-2 flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <BarChart3 size={14} className="text-purple-400" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Focus Distribution</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {anchorDistribution.slice(0, 4).map((anchor, i) => (
                        <div key={i} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-white/70">
                                <span className="truncate max-w-[100px]">{anchor.name}</span>
                                <span className="font-mono text-white/40">{anchor.percentage}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500/80 rounded-full"
                                    style={{ width: `${anchor.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {anchorDistribution.length === 0 && (
                        <span className="text-xs text-white/20 italic">No distribution data...</span>
                    )}
                </div>
            </div>

            {/* Stat 3: Media Mix */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-pink-400" />
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Media Type</span>
                </div>
                <div className="flex items-end gap-1 h-12 mt-2">
                    {mediaDistribution.web > 0 && (
                        <div className="flex-1 bg-blue-500/40 hover:bg-blue-500/60 transition-colors rounded-t-sm relative group" style={{ height: `${Math.max(15, (mediaDistribution.web / totalSnippetCount) * 100)}%` }}>
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-4 left-0 text-[9px] text-white bg-black px-1 rounded">Web</span>
                        </div>
                    )}
                    {mediaDistribution.text > 0 && (
                        <div className="flex-1 bg-white/20 hover:bg-white/40 transition-colors rounded-t-sm relative group" style={{ height: `${Math.max(15, (mediaDistribution.text / totalSnippetCount) * 100)}%` }}>
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-4 left-0 text-[9px] text-white bg-black px-1 rounded">Text</span>
                        </div>
                    )}
                    {mediaDistribution.image > 0 && (
                        <div className="flex-1 bg-purple-500/40 hover:bg-purple-500/60 transition-colors rounded-t-sm relative group" style={{ height: `${Math.max(15, (mediaDistribution.image / totalSnippetCount) * 100)}%` }}>
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-4 left-0 text-[9px] text-white bg-black px-1 rounded">Img</span>
                        </div>
                    )}
                    {mediaDistribution.file > 0 && (
                        <div className="flex-1 bg-cyan-500/40 hover:bg-cyan-500/60 transition-colors rounded-t-sm relative group" style={{ height: `${Math.max(15, (mediaDistribution.file / totalSnippetCount) * 100)}%` }}>
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-4 left-0 text-[9px] text-white bg-black px-1 rounded">File</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
