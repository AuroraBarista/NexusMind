"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, ArrowLeft, Target, Users, BookOpen, Activity, PlayCircle, Sparkles, Folder, CheckCircle, LayoutDashboard, Inbox, MessageSquare, Plus, Send, Trash2, ChevronRight, AlertCircle, Lightbulb, Map, Globe, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import { ProfileManager } from "@/components/ProfileManager";

interface ProjectDetails {
    id: string;
    name: string;
    description: string;
    objective: string;
    target_audience: string;
    health_score: {
        idea_clarity?: { label: string; status: 'check' | 'alert' }[];
        evidence_strength?: { label: string; count?: number; status: 'check' | 'alert' }[];
        execution_readiness?: { label: string; status: 'check' | 'alert' }[];
        momentum?: { status: 'High' | 'Medium' | 'Low'; reason: string; };
    } | null;
    roadmap: any[];
    current_stage?: string;
    next_action?: string | null;
    next_action_details?: {
        action: string;
        reason: string;
        expected_outcome: string;
        steps: string[];
    } | null;
    next_action_steps?: string[];
    project_brief?: {
        objective?: string;
        current_stage?: string;
        progress?: string;
        next_action?: string;
        key_knowledge_gaps?: string[];
    };
    strategic_pillars?: string[];
    progress: number;
}

interface Evidence {
    id: string;
    type: string;
    relevance_score: number;
    summary: string;
    contribution: string;
    insight?: string;
    decision_impact?: string;
    snippet: {
        id: string;
        content: string;
        created_at?: string;
        file_url?: string;
        ai_tags?: string[];
        summary?: string;
    };
}

const DEFAULT_ROADMAP = [
    { step: 'Discovery', status: 'active' },
    { step: 'Research', status: 'pending' },
    { step: 'Design', status: 'pending' },
    { step: 'Development', status: 'pending' },
    { step: 'Testing', status: 'pending' },
    { step: 'Launch', status: 'pending' }
];

const RichSnippetPreview = ({ snippet, isExpanded, onExpand, hideSummary = false, children }: { snippet: any, isExpanded: boolean, onExpand: (e: React.MouseEvent) => void, hideSummary?: boolean, children?: React.ReactNode }) => {
    if (!snippet) return null;
    const content = snippet.content || "";
    const isWebCapture = content.includes("[WEB_CAPTURE]");

    return (
        <div className={`relative z-10 flex flex-col gap-4 ${isExpanded ? '' : 'cursor-pointer'}`} onClick={onExpand}>
            {(() => {
                if (isWebCapture) {
                    const titleMatch = content.match(/\[WEB_CAPTURE\]\s*(.*?)(?::\s*|$)/);
                    const urlMatch = content.match(/URL:\s*(https?:\/\/[^\s]+)/) || content.match(/(https?:\/\/[^\s]+)/);
                    let cleanDescription = content
                        .replace(/\[WEB_CAPTURE\]/, "")
                        .replace(/URL:\s*https?:\/\/[^\s]+/, "")
                        .replace(urlMatch ? urlMatch[1] : "", "")
                        .trim();
                    if (cleanDescription.length < 5) cleanDescription = "Web Link Captured";
                    const title = titleMatch ? titleMatch[1] : "Web Resource";
                    const url = urlMatch ? urlMatch[1] : "#";
                    const domain = url !== "#" ? new URL(url).hostname.replace('www.', '') : "web";

                    return (
                        <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20 group/web shrink-0">
                            <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-blue-500/20 text-blue-300"><Globe size={10} /></div>
                                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">{domain}</span>
                                </div>
                                <ExternalLink size={10} className="text-white/20 group-hover/web:text-white/60 transition-colors" />
                            </div>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-white/5 transition-colors" onClick={e => e.stopPropagation()}>
                                <h3 className="text-sm font-medium text-blue-100/90 leading-snug mb-2 group-hover/web:text-blue-300 transition-colors">{title}</h3>
                                <p className={`text-[11px] text-white/40 font-light leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>{cleanDescription}</p>
                                <div className="mt-3 flex items-center gap-1 text-[9px] text-white/20 font-mono truncate">
                                    <span className="opacity-50">SOURCE:</span><span className="text-blue-400/40">{url}</span>
                                </div>
                            </a>
                        </div>
                    );
                }

                return (
                    <div className={`relative ${isExpanded ? '' : 'max-h-24 overflow-hidden fade-bottom'}`}>
                        <p className={`text-white/80 text-sm font-light leading-7 whitespace-pre-wrap font-sans ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {content}
                        </p>
                    </div>
                );
            })()}

            {/* Attachment Preview */}
            {snippet.file_url && (
                <div className="shrink-0">
                    {snippet.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/20 group/image">
                            <img src={snippet.file_url} alt="Attached Image" className="w-full h-48 object-cover transition-transform duration-700 group-hover/image:scale-105 opacity-80 group-hover/image:opacity-100" />
                            <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-md text-white/70 shadow-sm border border-white/10 opacity-0 group-hover/image:opacity-100 transition-opacity"><ImageIcon size={14} /></div>
                        </div>
                    ) : (
                        <a href={snippet.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group/file group/card" onClick={e => e.stopPropagation()}>
                            <div className="p-2.5 bg-gradient-to-br from-white/5 to-white/0 rounded-md border border-white/5 shadow-sm text-white/60 group-hover/card:text-cyan-300 group-hover/card:border-cyan-500/20 transition-all"><FileText size={18} /></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white/80 truncate group-hover/card:text-white transition-colors">{snippet.content.replace('[FILE_UPLOAD] ', '') || "Document"}</p>
                                <p className="text-[9px] text-white/40 uppercase tracking-wider font-sans mt-0.5 font-medium flex items-center gap-1.5">
                                    <span>{snippet.file_url.split('.').pop()?.toUpperCase() || 'FILE'}</span><span className="w-0.5 h-0.5 rounded-full bg-white/20"></span><span>ATTACHMENT</span>
                                </p>
                            </div>
                            <div className="text-white/20 group-hover/card:text-cyan-400 transition-colors"><ExternalLink size={12} /></div>
                        </a>
                    )}
                </div>
            )}

            {isExpanded && !hideSummary && snippet.summary && (
                <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-white/60 italic leading-relaxed font-sans bg-cyan-900/10 border border-cyan-500/10 p-2 rounded">
                        <Sparkles size={10} className="inline mr-1 text-cyan-400" /> {snippet.summary}
                    </p>
                </div>
            )}

            {children && (
                <div onClick={e => e.stopPropagation()} className="mt-2 shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
};

export default function ProjectExecutionEngine() {
    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [project, setProject] = useState<ProjectDetails | null>(null);
    const [evidence, setEvidence] = useState<Evidence[]>([]);
    const [inboxCaptures, setInboxCaptures] = useState<any[]>([]); // For manual linking
    const [suggestedEvidence, setSuggestedEvidence] = useState<any[]>([]); // AI Suggestions

    const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

    const [generatingInsights, setGeneratingInsights] = useState(false);
    const [linkingId, setLinkingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([{
        role: 'assistant',
        content: "I'm your AI Architect. Let's define the project objective and target audience. Ask me to update them when you're ready."
    }]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [canvasUpdated, setCanvasUpdated] = useState(false); // Track canvas updates for visual feedback

    const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
    const [expandedInboxId, setExpandedInboxId] = useState<string | null>(null);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !id) return;

        const newMessages = [...chatMessages, { role: 'user' as const, content: chatInput }];
        setChatMessages(newMessages);
        setChatInput('');
        setChatLoading(true);

        try {
            const res = await fetch('/api/project-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: id, messages: newMessages })
            });
            const data = await res.json();
            if (data.reply) {
                setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
            }
            if (data.projectUpdated) {
                // Trigger visual feedback
                setCanvasUpdated(true);
                setTimeout(() => setCanvasUpdated(false), 2000);
                // Silently refresh the project data so the canvas updates instantly
                fetchProjectData(false);
            }
        } catch (error) {
            console.error("Chat error:", error);
        }
        setChatLoading(false);
    };

    const linkEvidence = async (snippet_id: string) => {
        if (!id) return;
        setLinkingId(snippet_id);

        try {
            const res = await fetch('/api/evidence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: id,
                    snippet_id: snippet_id
                })
            });

            if (!res.ok) throw new Error("Failed to evaluate and link evidence");

            fetchProjectData(false); // Refresh UI smoothly
        } catch (error) {
            console.error("Failed to link evidence", error);
            alert("Failed to analyze and link evidence. Please try again.");
        }
        setLinkingId(null);
    };

    const handleDeleteEvidence = async (evidenceId: string) => {
        try {
            const res = await fetch(`/api/evidence?id=${evidenceId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Delete failed");

            // Re-fetch project data smoothly to update the UI
            fetchProjectData(false);
            if (expandedEvidenceId === evidenceId) {
                setExpandedEvidenceId(null);
            }
        } catch (error) {
            console.error("Failed to delete evidence", error);
            alert("Failed to delete evidence. Please try again.");
        }
    };

    const handleMarkActionCompleted = async () => {
        if (!id || !project || (!project.next_action_details && !project.next_action)) return;

        const actionText = project.next_action_details?.action || project.next_action;

        // Optimistic UI update
        const updatedProject = {
            ...project,
            next_action_details: null,
            next_action: null
        };
        setProject(updatedProject);
        setGeneratingInsights(true);

        try {
            // Append a message to the AI Architect seamlessly
            const systemMsg = `[SYSTEM MESSAGE]: The user has completed the action: "${actionText}". Please evaluate the project's current stage and generate the next operational steps.`;
            const newMessages = [...chatMessages, { role: 'user' as const, content: systemMsg }];
            setChatMessages(newMessages);

            // We ping the chat API so the Architect knows
            await fetch('/api/project-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: id, messages: newMessages })
            });

            // Then we force a full Stage/Insight recalculation
            await generateInsights();
        } catch (e) {
            console.error("Failed to mark action completed", e);
            setGeneratingInsights(false);
        }
    };

    const generateInsights = async () => {
        if (!id) return;
        setGeneratingInsights(true);
        try {
            // First generate global insights
            const res = await fetch('/api/project-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: id })
            });

            // Background refresh to reflect new Next Action, Health, and Brief
            fetchProjectData(false);
        } catch (e) {
            console.error("Failed to generate project insights", e);
        }
        setGeneratingInsights(false);
    };

    const fetchSuggestions = async () => {
        if (!id) return;
        setLoadingSuggestions(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const res = await fetch('/api/project-evidence-suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: id, user_id: user?.id })
            });
            const data = await res.json();
            setSuggestedEvidence(data.suggestions || []);
        } catch (e) {
            console.error("Failed to fetch suggestions:", e);
        }
        setLoadingSuggestions(false);
    }

    useEffect(() => {
        fetchProjectData(true);
    }, [id]);

    useEffect(() => {
        if (activeStep === 2) {
            fetchSuggestions();
        }
    }, [activeStep, id]);

    const fetchProjectData = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (id) {
            // Fetch Project Data
            const { data: pData, error: pError } = await supabase
                .from('project_anchors')
                .select('*')
                .eq('id', id)
                .single();

            if (pError || !pData) {
                console.error("Project not found", pError);
                router.push('/projects');
                return;
            }

            if (!pData.roadmap || pData.roadmap.length === 0) {
                pData.roadmap = DEFAULT_ROADMAP;
            }

            setProject(pData);

            // Fetch Evidence
            const { data: eData, error: eError } = await supabase
                .from('project_evidence')
                .select(`
                    id, type, relevance_score, summary, contribution, insight, decision_impact, snippet_id,
                    snippet:snippets(id, content, created_at, file_url, ai_tags, summary)
                `)
                .eq('project_id', id)
                .order('created_at', { ascending: false });

            let linkedSnippetIds = new Set<string>();
            if (!eError && eData) {
                setEvidence(eData as any[]);
                eData.forEach(e => linkedSnippetIds.add(e.snippet_id));
            }

            // Fetch All User Captures for Manual Linking
            let query = supabase.from('snippets').select('*');
            if (user) {
                query = query.or(`user_id.eq.${user.id},user_id.is.null`);
            } else {
                query = query.is('user_id', null);
            }

            const { data: snippetsData, error: snippetsError } = await query.order('created_at', { ascending: false });

            if (!snippetsError && snippetsData) {
                const unlinked = snippetsData.filter(s => !linkedSnippetIds.has(s.id));
                setInboxCaptures(unlinked);
            }
        }
        if (showLoader) setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-nebula text-white">
                <Loader2 className="animate-spin text-cyan-500" size={32} />
            </div>
        );
    }

    if (!project) return null;

    const renderHealthChecklist = (dimension: string, items?: any) => {
        if (!items || !Array.isArray(items) || items.length === 0) {
            return <div className="text-xs text-neutral-500 mt-2">Format outdated. Please click "Run AI Analysis" above to update.</div>;
        }
        return (
            <div className="space-y-2 mt-2">
                {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                        {item.status === 'check' ? (
                            <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                            <AlertCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
                        )}
                        <span className={item.status === 'check' ? 'text-neutral-300' : 'text-neutral-400'}>
                            {item.label} {item.count !== undefined && <span className="font-mono text-xs bg-white/10 px-1.5 rounded ml-1">{item.count}</span>}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-nebula text-white font-sans p-8 pl-72 select-none overflow-x-hidden">
            <SidebarNav />

            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/projects')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-neutral-400" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-display font-medium tracking-tight mb-1 flex items-center gap-3">
                                {project.name}
                                <span className="text-xs font-mono px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30">
                                    ACTIVE
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={generateInsights}
                            disabled={generatingInsights}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl transition-colors disabled:opacity-50 text-sm font-medium"
                        >
                            {generatingInsights ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {generatingInsights ? "Analyzing Project..." : "Run AI Analysis"}
                        </button>
                        <ProfileManager />
                    </div>
                </div>

                {/* Pipeline Stepper */}
                <div className="flex items-center gap-2 mb-2">
                    {[
                        { step: 1, label: 'Architect', icon: <MessageSquare size={14} /> },
                        { step: 2, label: 'Evidence', icon: <Folder size={14} /> },
                        { step: 3, label: 'Execution', icon: <PlayCircle size={14} /> }
                    ].map((s, idx) => (
                        <div key={s.step} className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveStep(s.step as 1 | 2 | 3)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeStep === s.step
                                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                    : activeStep > s.step
                                        ? 'bg-cyan-500/20 text-cyan-400'
                                        : 'bg-white/5 text-neutral-400 hover:bg-white/10'
                                    }`}
                            >
                                {s.icon} {s.label}
                            </button>
                            {idx < 2 && <ChevronRight size={16} className="text-neutral-600 mx-1" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* STEP 1: ARCHITECT */}
            {activeStep === 1 && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">

                    {/* Strategy Canvas */}
                    <div className={cn(
                        "glass-panel p-8 rounded-2xl border border-white/5 flex flex-col space-y-8 overflow-y-auto custom-scrollbar transition-all duration-1000",
                        canvasUpdated ? "shadow-[0_0_50px_rgba(168,85,247,0.3)] border-purple-500/50 bg-purple-500/10 scale-[1.01]" : ""
                    )}>
                        <div>
                            <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-purple-400">
                                <Target size={20} />
                                Strategy Canvas
                                {canvasUpdated && <Sparkles size={16} className="text-purple-300 animate-pulse ml-2" />}
                            </h2>
                            <p className="text-sm text-neutral-400 mb-6">Chat with the Architect to define and refine these core parameters.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-2 font-semibold">Core Objective</h3>
                                <p className="text-base text-neutral-200 leading-relaxed">{project.objective || "Not defined yet. Tell the Architect what this project is trying to achieve."}</p>
                            </div>

                            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-2 font-semibold flex items-center gap-2">
                                    <Users size={14} /> Target Audience
                                </h3>
                                <p className="text-base text-neutral-200 leading-relaxed">{project.target_audience || "Who is this for? Ask the Architect to define the audience."}</p>
                            </div>

                            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
                                    <Lightbulb size={14} /> Strategic Pillars
                                </h3>
                                {project.strategic_pillars && project.strategic_pillars.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-2 text-neutral-300 text-sm">
                                        {project.strategic_pillars.map((pillar, i) => <li key={i}>{pillar}</li>)}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-neutral-500 italic">No strategic pillars assigned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Chat */}
                    <div className="glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden bg-black/20">
                        <div className="p-4 border-b border-white/5 bg-purple-500/5">
                            <h3 className="font-medium flex items-center gap-2 text-purple-400">
                                <MessageSquare size={16} /> AI Architect
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-purple-500/20 text-white rounded-br-sm border border-purple-500/30' : 'bg-white/5 text-neutral-200 rounded-bl-sm border border-white/5'}`}>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 rounded-2xl p-4 rounded-bl-sm border border-white/5 flex gap-2 items-center">
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-75" />
                                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-150" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestion Chips */}
                        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
                            <button onClick={() => setChatInput("Help me define my Target Audience")} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 whitespace-nowrap transition-colors">
                                Help me define my Target Audience
                            </button>
                            <button onClick={() => setChatInput("Let's set a Core Objective")} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 whitespace-nowrap transition-colors">
                                Let's set a Core Objective
                            </button>
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 pt-1 border-t border-white/5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={chatLoading}
                                    placeholder="e.g. 'Update the objective to focus on a minimal viable product...'"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-neutral-600"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || chatLoading}
                                    className="absolute right-2 top-2 bottom-2 bg-purple-500 text-black w-10 rounded-lg flex items-center justify-center hover:bg-purple-400 transition-colors disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* STEP 2: EVIDENCE */}
            {activeStep === 2 && (
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">

                    {/* Left: Curation Engine (AI Suggestions + Manual) */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium flex items-center gap-2 text-amber-400 mb-1">
                                <Sparkles size={20} />
                                Need to Know
                            </h2>
                            <p className="text-sm text-neutral-400">Review captures and link relevant ones to fill knowledge gaps.</p>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                            {/* AI Suggestions Block */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/70 mb-3 flex items-center gap-2">
                                    Suggested by AI <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[10px]">{suggestedEvidence.length}</span>
                                </h3>
                                {loadingSuggestions ? (
                                    <div className="flex items-center gap-2 text-sm text-amber-500/50 p-4 border border-dashed border-amber-500/20 rounded-xl">
                                        <Loader2 size={14} className="animate-spin" /> Mining inbox for relevant evidence...
                                    </div>
                                ) : suggestedEvidence.length === 0 ? (
                                    <div className="text-center p-4 border border-dashed border-white/10 rounded-xl text-neutral-500 text-sm">
                                        No new relevant suggestions found in Inbox.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {suggestedEvidence.map(s => {
                                            const fullSnippet = inboxCaptures.find(c => c.id === s.id);
                                            if (!fullSnippet) return null;
                                            const isExpanded = expandedInboxId === fullSnippet.id;
                                            return (
                                                <div key={s.id} className={`border rounded-xl p-4 transition-all ${isExpanded ? 'bg-amber-500/10 border-amber-500/40' : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30'} flex flex-col gap-3 group`}>
                                                    <div className="text-xs font-medium text-amber-400 flex items-start gap-2 mb-1">
                                                        <Sparkles size={12} className="mt-0.5 shrink-0" />
                                                        "{s.reasoning}"
                                                    </div>
                                                    <RichSnippetPreview snippet={fullSnippet} isExpanded={isExpanded} onExpand={() => setExpandedInboxId(isExpanded ? null : fullSnippet.id)}>
                                                        <button
                                                            onClick={() => linkEvidence(s.id)}
                                                            disabled={linkingId === s.id}
                                                            className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-500/30 transition-colors font-medium border border-amber-500/20 disabled:opacity-50 ml-auto"
                                                        >
                                                            {linkingId === s.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                                            Add as Evidence
                                                        </button>
                                                    </RichSnippetPreview>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Manual Inbox Block */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-2">
                                    Manual Capture Inbox <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[10px]">{inboxCaptures.length}</span>
                                </h3>
                                <div className="space-y-3">
                                    {inboxCaptures.filter(c => !suggestedEvidence.find(s => s.id === c.id)).map(capture => {
                                        const isExpanded = expandedInboxId === capture.id;
                                        return (
                                            <div key={capture.id} className={`border rounded-xl p-4 transition-all ${isExpanded ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'} flex flex-col gap-3`}>
                                                <div className="flex justify-between items-center text-xs text-neutral-500 mb-1">
                                                    <span>{capture.title || (capture.created_at ? new Date(capture.created_at).toLocaleDateString() : 'Capture')}</span>
                                                    <span className="px-2 py-0.5 bg-white/10 rounded tracking-wider uppercase text-[10px]">{capture.type || 'Text'}</span>
                                                </div>
                                                <RichSnippetPreview snippet={capture} isExpanded={isExpanded} onExpand={() => setExpandedInboxId(isExpanded ? null : capture.id)}>
                                                    <button
                                                        onClick={() => linkEvidence(capture.id)}
                                                        disabled={linkingId === capture.id}
                                                        className="flex items-center gap-1.5 text-xs bg-white/10 text-neutral-300 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors border border-transparent hover:border-cyan-500/30 disabled:opacity-50 ml-auto"
                                                    >
                                                        {linkingId === capture.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                                        Link
                                                    </button>
                                                </RichSnippetPreview>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Active Evidence Library */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col h-full overflow-hidden bg-black/20">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-medium flex items-center gap-2 text-cyan-400">
                                    <Folder size={20} />
                                    Project Evidence
                                </h2>
                                <p className="text-sm text-neutral-400 mt-1">Official materials shaping this project.</p>
                            </div>
                            <div className="text-2xl font-light text-cyan-500/50">{evidence.length}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                            {evidence.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center opacity-50">
                                    <Folder size={48} className="text-neutral-600 mb-4" />
                                    <p className="text-sm text-neutral-400">No evidence attached yet.</p>
                                </div>
                            ) : (
                                evidence.map((item) => {
                                    const isExpanded = expandedEvidenceId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => setExpandedEvidenceId(isExpanded ? null : item.id)}
                                            className={`p-4 border rounded-xl text-sm transition-all cursor-pointer ${isExpanded ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[10px] font-bold text-cyan-400 px-2 py-1 bg-cyan-400/10 rounded tracking-wider uppercase">{item.type}</span>
                                                <span className="text-[10px] text-neutral-500 font-mono">Rel: {item.relevance_score}</span>
                                            </div>

                                            {/* RICH SNIPPET RENDERER */}
                                            <RichSnippetPreview snippet={item.snippet} isExpanded={isExpanded} onExpand={() => setExpandedEvidenceId(isExpanded ? null : item.id)} hideSummary={true} />

                                            <div className="mt-4 space-y-2">
                                                {item.insight && (
                                                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5"><Lightbulb size={12} /> AI Insight</span>
                                                        <p className="text-xs text-amber-200 leading-relaxed">{item.insight}</p>
                                                    </div>
                                                )}
                                                {item.decision_impact && (
                                                    <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5"><Target size={12} /> Decision Impact</span>
                                                        <p className="text-xs text-emerald-200 leading-relaxed">{item.decision_impact}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {isExpanded && (
                                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteEvidence(item.id);
                                                        }}
                                                        className="text-xs text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1 shrink-0"
                                                    >
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: EXECUTION */}
            {activeStep === 3 && (
                <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-220px)] space-y-6">

                    {/* Top Row: AI Project Brief */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-400" />
                            AI Project Brief
                        </h2>
                        {project.project_brief?.objective ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-3">
                                    <p className="text-lg text-white font-medium leading-relaxed">
                                        "{project.project_brief.objective}"
                                    </p>
                                    <div className="flex gap-4 text-sm">
                                        <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><span className="text-neutral-500 mr-2">Stage:</span><span className="text-cyan-400">{project.project_brief.current_stage}</span></div>
                                        <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><span className="text-neutral-500 mr-2">Progress:</span><span className="text-emerald-400">{project.project_brief.progress}</span></div>
                                    </div>
                                </div>
                                <div className="bg-black/20 p-4 rounded-xl border border-rose-500/10">
                                    <h3 className="text-xs font-semibold uppercase text-rose-400 mb-2">Knowledge Gaps</h3>
                                    <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1">
                                        {(project.project_brief.key_knowledge_gaps || []).map((gap, i) => <li key={i}>{gap}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-neutral-500 italic">Project brief not generated yet. Click "Run AI Analysis" to generate.</div>
                        )}
                    </div>

                    {/* Stage Indicator (Horizontal) */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-black/20">
                        <div className="flex items-center justify-between">
                            {['IDEA', 'RESEARCH', 'VALIDATION', 'PROTOTYPE', 'BUILD', 'LAUNCH'].map((stage, idx, arr) => {
                                const isActive = project.current_stage === stage;
                                const isPassed = arr.indexOf(project.current_stage || 'IDEA') > idx;
                                return (
                                    <div key={stage} className="flex-1 flex items-center">
                                        <div className={`flex flex-col items-center relative z-10 ${isActive ? 'scale-110' : ''} transition-transform`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 shadow-lg ${isActive ? 'bg-cyan-500 border-cyan-400 text-black shadow-cyan-500/20' : isPassed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-black/50 border-white/10 text-white/20'}`}>
                                                {isActive ? <PlayCircle size={18} className="animate-pulse" /> : isPassed ? <CheckCircle size={18} /> : <div className="w-2 h-2 rounded-full bg-white/20" />}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-cyan-400' : isPassed ? 'text-emerald-500/70' : 'text-neutral-600'}`}>{stage}</span>
                                        </div>
                                        {idx !== arr.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 ${isPassed ? 'bg-emerald-500/50' : 'bg-white/5'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Row: Next Action & Health */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">

                        {/* Next Action Breakdown */}
                        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 flex flex-col overflow-y-auto custom-scrollbar">
                            <h2 className="text-lg font-medium mb-6 flex items-center gap-2 text-cyan-400">
                                <PlayCircle size={18} />
                                Next Action
                            </h2>
                            <div className="flex-1 flex flex-col">
                                {project.next_action_details || project.next_action ? (
                                    <>
                                        <div className="bg-black/40 p-5 rounded-xl border border-cyan-500/20 mb-6 space-y-4">
                                            <div>
                                                <h3 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-1">Focus Action</h3>
                                                <p className="text-lg text-white font-medium leading-snug">
                                                    {project.next_action_details?.action || project.next_action}
                                                </p>
                                            </div>

                                            {project.next_action_details?.reason && (
                                                <div className="pt-3 border-t border-cyan-500/20">
                                                    <span className="text-[10px] text-cyan-500/70 uppercase tracking-wider block mb-1">Why Now?</span>
                                                    <p className="text-sm text-cyan-100/80">{project.next_action_details.reason}</p>
                                                </div>
                                            )}

                                            {project.next_action_details?.expected_outcome && (
                                                <div className="pt-3 border-t border-cyan-500/20 flex gap-2 items-start">
                                                    <Target size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <span className="text-[10px] text-emerald-500/70 uppercase tracking-wider block mb-0.5">Expected Outcome</span>
                                                        <p className="text-sm text-emerald-100/90">{project.next_action_details.expected_outcome}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-xs font-semibold uppercase text-neutral-500 mb-3 tracking-wider">Operational Steps</h3>
                                        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                            {(project.next_action_details?.steps || project.next_action_steps || []).map((step, idx) => (
                                                <div key={idx} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="w-6 h-6 rounded bg-black/40 border border-white/10 flex items-center justify-center text-[10px] text-neutral-500 font-mono shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-sm text-neutral-200 mt-0.5 leading-relaxed">{step}</p>
                                                </div>
                                            ))}
                                            {(!(project.next_action_details?.steps) && !(project.next_action_steps)) && (
                                                <div className="text-sm text-neutral-500 italic">No detailed steps generated.</div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-cyan-500/20 flex justify-end">
                                            <button onClick={handleMarkActionCompleted} disabled={generatingInsights || (!project.next_action_details && !project.next_action)} className="px-6 py-2 bg-cyan-500 text-black font-bold text-sm rounded-full hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                                {generatingInsights && (!project.next_action_details && !project.next_action) ? <Loader2 size={14} className="animate-spin" /> : null}
                                                Mark Completed
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                                        <PlayCircle size={48} className="text-cyan-500 mb-4 opacity-50" />
                                        <p className="text-neutral-400 text-sm">Action engine pending.<br />Generate insights to see next steps.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Explainable Health */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
                            <h2 className="text-lg font-medium mb-6 flex items-center gap-2 text-rose-400">
                                <Activity size={18} />
                                Explainable Health
                            </h2>

                            <div className="space-y-6 flex-1">
                                {project.health_score ? (
                                    <>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                            <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-2 tracking-wider">Idea Clarity</h3>
                                            {renderHealthChecklist('idea_clarity', project.health_score?.idea_clarity)}
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                            <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-2 tracking-wider">Evidence Strength</h3>
                                            {renderHealthChecklist('evidence_strength', project.health_score?.evidence_strength)}
                                        </div>
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                            <h3 className="text-xs font-semibold uppercase text-neutral-400 mb-2 tracking-wider">Execution Readiness</h3>
                                            {renderHealthChecklist('execution_readiness', project.health_score?.execution_readiness)}
                                        </div>

                                        {/* Momentum */}
                                        <div className="bg-fuchsia-500/10 p-4 rounded-xl border border-fuchsia-500/20">
                                            <h3 className="text-xs font-semibold uppercase text-fuchsia-400 mb-2 tracking-wider flex items-center gap-1.5"><Activity size={14} /> Momentum</h3>
                                            {project.health_score?.momentum ? (
                                                <div className="space-y-2 mt-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${project.health_score.momentum.status === 'High' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                            project.health_score.momentum.status === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                                                'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                                            }`}>
                                                            {project.health_score.momentum.status}
                                                        </div>
                                                    </div>
                                                    <p className="text-fuchsia-200/80 leading-relaxed text-xs">
                                                        {project.health_score.momentum.reason}
                                                    </p>
                                                    {project.health_score.momentum.status === 'Low' && (
                                                        <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded p-2 text-xs text-red-400 font-medium">
                                                            ⚠️ Project momentum is dropping. Link more evidence or complete actions to re-engage.
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-xs text-fuchsia-500/50 mt-2">Momentum not calculated. Run AI analysis.</div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10 opacity-50">
                                        <p className="text-sm text-neutral-400">Health checks not run yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

