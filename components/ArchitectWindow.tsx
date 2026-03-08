"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2, Sparkles, CheckCircle, ArrowRight, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ArchitectWindowProps {
    projectName: string;
    initialGoal: string;
    initialPlan?: PlanDraft | null; // Added prop
    onClose: () => void;
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

interface PlanDraft {
    project_title: string;
    project_type: string;
    core_objective: string;
    target_audience: string; // New
    structural_pillars: string[];
    roadmap_steps: { step: number; action: string; phase?: string }[];
    missing_info?: string[]; // New
}

export function ArchitectWindow({ projectName, initialGoal, initialPlan, onClose }: ArchitectWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [plan, setPlan] = useState<PlanDraft | null>(initialPlan || null); // Initialize with prop
    const [isFinalized, setIsFinalized] = useState(!!initialPlan); // If plan exists, it's virtually finalized (or at least draft is ready)
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial greeting
    useEffect(() => {
        let initialMsg: Message;

        if (initialPlan) {
            initialMsg = {
                role: "assistant",
                content: `**Welcome back.**\n\nI have loaded the execution plan for **"${projectName}"**.\n\nWe can continue refining this plan, or you can proceed to the dashboard if you are ready to execute.`
            };
        } else {
            initialMsg = {
                role: "assistant",
                content: `Hello. I am the **Nexus Architect**.\n\nI see you want to start project: **"${projectName}"**.\nTo build a robust execution plan, I need to refine your objective: "${initialGoal}".\n\nFirst, who is the primary audience or stakeholder for this project?`
            };
        }
        setMessages([initialMsg]);
    }, [initialPlan, projectName, initialGoal]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMsg: Message = { role: "user", content: input };
        const updatedHistory = [...messages, newMsg];
        setMessages(updatedHistory);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/architect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: updatedHistory.filter(m => m.role !== "system"), // Don't send system prompts if any
                    projectName,
                    currentGoal: initialGoal
                }),
            });

            if (!res.ok) throw new Error("Architect unreachable");

            const data = await res.json();

            setMessages(prev => [...prev, { role: "assistant", content: data.message_to_user }]);

            if (data.plan_draft) {
                setPlan(data.plan_draft);
            }

            if (data.is_finalized) {
                setIsFinalized(true);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: "assistant", content: "Connection lost. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSavePlan = async () => {
        if (!plan) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/update-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName,
                    execution_plan: plan
                })
            });
            if (!res.ok) throw new Error("Save failed");
            // Show brief success (could use a toast, but keeping it simple)
            alert("Plan saved successfully!");
        } catch (error) {
            console.error("Save error:", error);
            alert("Failed to save plan.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-[85vh] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden relative">

                {/* LEFT: Chat Interface */}
                <div className="flex-1 flex flex-col border-r border-white/5 bg-black/20">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-display font-medium text-white">Nexus Architect</h3>
                                <p className="text-xs text-neutral-400">Designing execution strategy</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-xs font-medium text-white/40 hover:text-white flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                        >
                            Skip to Dashboard <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-purple-900/30 text-purple-400'
                                    }`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                    ? 'bg-white/10 text-white rounded-tr-none'
                                    : 'bg-black/40 border border-white/5 text-neutral-300 rounded-tl-none'
                                    }`}>
                                    {msg.content}
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center shrink-0">
                                    <Loader2 size={14} className="animate-spin" />
                                </div>
                                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 rounded-tl-none">
                                    <span className="text-xs text-neutral-500 animate-pulse">Designing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/5 bg-black/40">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type your answer..."
                                disabled={isLoading}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-neutral-600"
                                autoFocus
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-2 p-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:bg-transparent disabled:text-neutral-600 transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Live Plan Preview */}
                <div className="w-[400px] bg-[#0a0f1c] flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-1">Live Blueprint</h3>
                            <h2 className="text-lg font-display text-white">{plan ? "Drafting Plan..." : "Waiting for input..."}</h2>
                        </div>
                        {/* Save Button */}
                        {plan && (
                            <button
                                onClick={handleSavePlan}
                                disabled={isSaving}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                title="Save current plan"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {plan ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Header: Title & Type */}
                                <div className="space-y-1 pb-4 border-b border-white/5">
                                    <h2 className="text-xl font-display font-medium text-white tracking-tight">{plan.project_title || "Untitled Project"}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/5 text-neutral-400 border border-white/5">
                                            {plan.project_type || "General"}
                                        </span>
                                        {plan.target_audience && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20 truncate max-w-[200px]" title={plan.target_audience}>
                                                🎯 {plan.target_audience}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Objective */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Core Objective</h4>
                                    <p className="text-sm text-cyan-100/90 font-medium leading-relaxed bg-cyan-950/30 p-4 rounded-lg border border-cyan-500/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.1)]">
                                        {plan.core_objective}
                                    </p>
                                </div>

                                {/* Missing Info (Warning) */}
                                {plan.missing_info && plan.missing_info.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500">Missing Intel</h4>
                                        <ul className="space-y-1">
                                            {plan.missing_info.map((info, i) => (
                                                <li key={i} className="text-xs text-amber-200/80 flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">•</span>
                                                    {info}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Pillars */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-blue-400">Structural Pillars</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {plan.structural_pillars?.map((pillar, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-900/20 text-blue-300 border border-blue-500/20 rounded-full text-xs">
                                                {pillar}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Roadmap */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-green-400">Execution Roadmap</h4>
                                    <div className="space-y-2 relative">
                                        <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
                                        {plan.roadmap_steps?.map((step, i) => (
                                            <div key={i} className="relative pl-8 group">
                                                <div className="absolute left-[9px] top-2 w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-green-500 transition-colors" />
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex flex-col gap-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-neutral-500 uppercase font-bold">Step {step.step}</span>
                                                        {step.phase && <span className="text-[10px] text-neutral-600 uppercase tracking-wider">{step.phase}</span>}
                                                    </div>
                                                    <div className="text-xs text-neutral-300 leading-snug">{step.action}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-4">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center">
                                    <Sparkles size={24} className="opacity-20" />
                                </div>
                                <p className="text-sm text-center px-8">Analysis pending... Discuss with the Architect to generate your blueprint.</p>
                            </div>
                        )}
                    </div>

                    {/* Final Action */}
                    {isFinalized && (
                        <div className="p-6 border-t border-white/5 bg-green-900/10">
                            <div className="flex items-center gap-3 mb-4 text-green-400">
                                <CheckCircle size={20} />
                                <span className="font-bold text-sm">Plan Finalized</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                Enter Project <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
