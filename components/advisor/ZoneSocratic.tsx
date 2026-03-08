import { Sparkles, MessageSquare, BrainCircuit } from "lucide-react";
import { useState } from "react";

interface ZoneSocraticProps {
    question: string;
}

export function ZoneSocratic({ question }: ZoneSocraticProps) {
    const [answer, setAnswer] = useState("");

    return (
        <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-500 to-blue-500 overflow-hidden group">
            <div className="absolute inset-0 bg-black/90 m-[1px] rounded-2xl" />

            <div className="relative z-10 p-6 bg-black/40 backdrop-blur-xl rounded-2xl h-full">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg shadow-purple-900/40">
                        <BrainCircuit size={18} className="text-white" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
                        Neural Reflection
                    </h3>
                </div>

                <div className="mb-6">
                    <p className="text-xl md:text-2xl font-serif italic text-white leading-relaxed opacity-90">
                        "{question}"
                    </p>
                </div>

                <div className="relative group/input">
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your reflection here..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none h-24"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover/input:opacity-100 transition-opacity">
                        {answer && (
                            <button className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-purple-900/20 flex items-center gap-2">
                                Save Insight <MessageSquare size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
