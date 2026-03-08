
import { X } from "lucide-react";
import { ProjectAdvisor } from "./ProjectAdvisor";

interface SynthesisModalProps {
    projectName: string;
    onClose: () => void;
}

export function SynthesisModal({ projectName, onClose }: SynthesisModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-6xl h-full max-h-[90vh] bg-[#080c14] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_15px_cyan]" />
                        <div>
                            <h2 className="text-2xl font-display font-medium text-white tracking-tight">Active Synthesis</h2>
                            <p className="text-sm text-white/40 font-mono tracking-widest uppercase">
                                Advisor Core • {projectName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Reusing ProjectAdvisor */}
                <div className="flex-1 overflow-hidden relative bg-nebula-subtle">
                    <ProjectAdvisor projectName={projectName} />
                </div>
            </div>
        </div>
    );
}
