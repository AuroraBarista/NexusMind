"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ProjectAnchorBar } from "./ProjectAnchorBar";
import { CaptureInput } from "./CaptureInput";
import { RecentSnippets } from "./RecentSnippets";
import { DragDropUpload } from "./DragDropUpload";
import { SidebarNav } from "./SidebarNav";
import { CaptureInsightsPanel } from "./CaptureInsightsPanel";
import { Sparkles, Trash2, Network, Terminal, Settings, Paperclip, Maximize2, FileText, ExternalLink, Globe, ArrowLeft, PenSquare, BrainCircuit, Lightbulb } from "lucide-react";
import { EditProjectModal } from "./EditProjectModal";
import { SynthesisModal } from "./SynthesisModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { ArchitectWindow } from "./ArchitectWindow"; // Import Architect
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Nebula loaded lazily if we want to toggle it back later
const KnowledgeNebula = dynamic(() => import("./KnowledgeNebula"), { ssr: false });

interface Snippet {
    id: string;
    content: string;
    type: string;
    status: "processing" | "done" | "error";
    project_anchor: string;
    createdAt: Date;
    file_url?: string;
    summary?: string;
    ai_tags?: string[];
    is_processed?: boolean;
}

interface DashboardProps {
    initialProject?: {
        id: string;
        name: string;
    };
}

export function Dashboard({ initialProject }: DashboardProps) {
    const supabase = createClient();
    const router = useRouter();

    // Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSynthesisModal, setShowSynthesisModal] = useState(false);
    const [projectDetails, setProjectDetails] = useState<any>(null); // For editing

    // Data State
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [activeSnippet, setActiveSnippet] = useState<Snippet | null>(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // AI Suggestion State
    const [suggestedProject, setSuggestedProject] = useState<{ topic: string } | null>({ topic: "iOS Development" }); // Mocked for now based on PRD

    // Options State
    const [showInsights, setShowInsights] = useState(false);

    // Prevent duplicate processing requests
    const processingRefs = useRef(new Set<string>());

    useEffect(() => {
        // Fetch snippets
        fetchSnippets();

        // Fetch Project Details for Edit Modal if needed (leaving hook structure for now)
        setProjectDetails(null);

        const channel = supabase
            .channel('realtime-snippets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'snippets' }, () => {
                fetchSnippets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [initialProject?.name]); // Re-run if project changes

    const fetchSnippets = async () => {
        try {
            const res = await fetch("/api/get-nebula-links");
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Fetch failed");
            }
            const data = await res.json();
            if (data.nodes) {
                const mappedNodes = data.nodes.map((n: any) => ({
                    ...n,
                    createdAt: new Date(n.created_at),
                }));
                const sorted = mappedNodes.sort((a: Snippet, b: Snippet) => b.createdAt.getTime() - a.createdAt.getTime());
                setSnippets(sorted);
            }
        } catch (e: any) {
            console.error("Failed to fetch snippets", e);
            alert(`Dashboard Sync Error: ${e.message}`);
        }
    };

    const handleCapture = async (content: string, file: File | null) => {

        let fileUrl = null;
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file);
            if (!uploadError) {
                const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
                fileUrl = data.publicUrl;
            } else {
                console.error("Manual Upload Error:", uploadError);
                alert("Upload failed during capture.");
                return;
            }
        }

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase.from("snippets").insert([{
            content,
            file_url: fileUrl,
            status: "processing",
            user_id: user?.id
        }]).select();

        if (error) {
            console.error("Capture Insert Error:", error);
            alert(`Capture failed: ${error.message}`);
            return;
        }

        if (data) {
            triggerAIProcessing(data[0].id);
        }
    };

    const filteredSnippets = snippets; // Show all snippets on the dashboard

    const handleDeleteSnippet = async (id: string) => {
        const { error } = await supabase.from('snippets').delete().eq('id', id);
        if (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete snippet");
        } else {
            setSnippets(prev => prev.filter(s => s.id !== id));
            if (activeSnippet?.id === id) setActiveSnippet(null);
        }
    };

    // Real AI Processing Trigger
    const triggerAIProcessing = async (snippetId: string) => {
        if (processingRefs.current.has(snippetId)) return; // Already processing
        processingRefs.current.add(snippetId);

        try {
            console.log("Triggering AI for:", snippetId);
            const res = await fetch('/api/process-brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ snippetId })
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("AI Processing Failed:", error);
                processingRefs.current.delete(snippetId); // Allow retry on failure
                throw new Error(error.error || "Processing failed");
            }

            const data = await res.json();
            console.log("AI Processing Success:", data);

            // Refresh to show result
            fetchSnippets();

        } catch (error) {
            console.error("Error triggering AI:", error);
            processingRefs.current.delete(snippetId); // Allow retry
        }
    };

    // Manual Retry Handler
    const handleRetry = (id: string) => {
        console.log("Manual retry for:", id);
        // Force retry by removing from ref (just in case) and calling trigger
        processingRefs.current.delete(id);
        triggerAIProcessing(id);
    };

    // Watch for new processing items
    useEffect(() => {
        if (!snippets.length) return;

        snippets.forEach(s => {
            if (s.status === 'processing' && !s.is_processed) {
                const age = Date.now() - new Date(s.createdAt).getTime();
                if (age < 300000) {
                    triggerAIProcessing(s.id);
                }
            }
        });
    }, [snippets]);

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans selection:bg-cyan-500/30 text-white bg-[#030014] bg-nebula pl-64">
            {/* Navigation */}
            <SidebarNav />

            {/* Main Layout */}
            <div className="flex justify-center h-screen pt-24 pb-8 px-8 gap-8 overflow-y-auto md:overflow-hidden">

                {/* Left Column: Capture Flow */}
                <div className={cn(
                    "flex flex-col gap-6 h-full overflow-hidden transition-all duration-500",
                    showInsights ? "w-full md:w-2/3" : "w-full max-w-4xl"
                )}>

                    {/* 1. Quick Input (Enlarged) */}
                    <div className="shrink-0 animate-in fade-in slide-in-from-top-5 duration-700 pt-4">
                        <CaptureInput onCapture={handleCapture} />
                    </div>

                    {/* AI Project Suggestion Banner */}
                    {suggestedProject && (
                        <div className="shrink-0 bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-[0_0_20px_-5px_rgba(59,130,246,0.2)]">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                    <Lightbulb size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-blue-100">Project Pattern Detected</h4>
                                    <p className="text-xs text-blue-300/80 font-light mt-1">
                                        You seem to be researching <span className="font-medium text-blue-200">{suggestedProject.topic}</span>.
                                        Would you like to formalize this into a project?
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                            >
                                Create Project
                            </button>
                        </div>
                    )}

                    {/* 2. Feed of Recent Captures */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden mt-4">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <h2 className="text-sm font-mono tracking-widest text-neutral-400 uppercase">Incoming Streams</h2>
                            <button
                                onClick={() => setShowInsights(!showInsights)}
                                className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-500/70 hover:text-cyan-400 transition-colors bg-cyan-500/10 px-3 py-1.5 rounded-full"
                            >
                                <BrainCircuit size={14} />
                                {showInsights ? "Hide AI Insights" : "Show AI Insights"}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin rounded-2xl pr-4">
                            {filteredSnippets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center opacity-50 mt-10">
                                    <Sparkles className="text-cyan-500/50 mb-4" size={40} />
                                    <p className="text-lg font-medium text-white/80 tracking-wide mb-2">Space to Think</p>
                                    <p className="text-sm text-white/50 max-w-sm">Dump your first link, thought, or image into the input above. NexusMind will automatically parse it and build connections.</p>
                                </div>
                            ) : (
                                <RecentSnippets
                                    snippets={filteredSnippets}
                                    onDelete={handleDeleteSnippet}
                                    onSelect={setActiveSnippet}
                                    onRetry={handleRetry}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Insights Panel */}
                {showInsights && (
                    <div className="hidden md:block w-1/3 h-full relative animate-in fade-in slide-in-from-right-8 duration-500">
                        <CaptureInsightsPanel />
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateProjectModal
                    onClose={() => setShowCreateModal(false)}
                    onProjectCreated={(name) => {
                        // Project creation could auto-associate in the future
                        setSuggestedProject(null); // Clear suggestion
                    }}
                />
            )}

            {showEditModal && projectDetails && (
                <EditProjectModal
                    project={projectDetails}
                    onClose={() => setShowEditModal(false)}
                    onProjectUpdated={() => {
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
}
