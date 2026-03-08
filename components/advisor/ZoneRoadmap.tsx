import { AlertTriangle, CheckCircle, MapPin, Navigation, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ZoneRoadmapProps {
    phaseInfo: {
        current_phase: string;
        status: "ON_TRACK" | "DRIFTING" | "OFF_TRACK";
        message: string;
        detour_suggestion?: string;
    };
}

export function ZoneRoadmap({ phaseInfo }: ZoneRoadmapProps) {
    const isOffTrack = phaseInfo.status !== "ON_TRACK";
    const statusColor = phaseInfo.status === "ON_TRACK" ? "text-green-400" :
        phaseInfo.status === "DRIFTING" ? "text-yellow-400" : "text-red-400";

    const borderColor = phaseInfo.status === "ON_TRACK" ? "border-green-500/20" :
        phaseInfo.status === "DRIFTING" ? "border-yellow-500/20" : "border-red-500/20";

    const bgGradient = phaseInfo.status === "ON_TRACK" ? "from-green-900/10" :
        phaseInfo.status === "DRIFTING" ? "from-yellow-900/10" : "from-red-900/10";

    return (
        <div className={`p-5 rounded-2xl border ${borderColor} bg-gradient-to-r ${bgGradient} to-transparent relative overflow-hidden backdrop-blur-sm`}>
            {/* Header: Phase & Status */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Current Phase</span>
                    </div>
                    <h3 className="text-2xl font-display font-medium text-white tracking-tight flex items-center gap-3">
                        {phaseInfo.current_phase}
                        {phaseInfo.status === "ON_TRACK" && <CheckCircle size={18} className="text-green-500" />}
                        {phaseInfo.status !== "ON_TRACK" && <AlertTriangle size={18} className={statusColor} />}
                    </h3>
                </div>

                {/* Status Badge */}
                <div className={`px-3 py-1 rounded-full border ${borderColor} ${statusColor} bg-black/40 text-[10px] font-bold uppercase tracking-widest`}>
                    {phaseInfo.status.replace('_', ' ')}
                </div>
            </div>

            {/* Message */}
            <p className="text-sm text-neutral-300 font-light leading-relaxed max-w-2xl">
                {phaseInfo.message}
            </p>

            {/* Action Area */}
            {isOffTrack && phaseInfo.detour_suggestion && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 flex flex-col md:flex-row gap-4 items-start md:items-center bg-black/40 p-4 rounded-xl border border-white/5"
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Navigation size={14} className="text-cyan-400" />
                            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Recommended Detour</span>
                        </div>
                        <p className="text-sm text-neutral-400">{phaseInfo.detour_suggestion}</p>
                    </div>
                    <button
                        onClick={() => alert("Detour Action - This would update your search strategy.")}
                        className="shrink-0 px-4 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                    >
                        Initiate Detour <ArrowRight size={12} />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
