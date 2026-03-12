"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, X, Folder, LayoutGrid, Loader2, Sparkles, TrendingUp, Activity, CheckCircle2, Circle } from "lucide-react";
import { ProfileManager } from "@/components/ProfileManager";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { SidebarNav } from "@/components/SidebarNav";

interface Project {
    id: string;
    name: string;
    color: string;
    description: string;
    created_at: string;
    objective?: string;
    next_action?: string;
    progress?: number;
    evidence_count?: number;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        // Fetch project anchors and the count of their related evidence
        const { data, error } = await supabase
            .from('project_anchors')
            .select(`
                *,
                project_evidence (count)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
        } else if (data) {
            const formattedProjects = data.map((p: any) => ({
                ...p,
                evidence_count: p.project_evidence?.[0]?.count || 0
            }));
            setProjects(formattedProjects);
        }
        if (showLoader) setLoading(false);
    };

    const handleProjectCreated = (name: string) => {
        // Refresh list after creation
        fetchProjects();
        setIsModalOpen(false);
    };

    const deleteProject = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const { error } = await supabase.from('project_anchors').delete().match({ id });
            if (!error) {
                fetchProjects(false);
            } else {
                console.error("Failed to delete project:", error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getHealthStatus = (healthObj: any) => {
        if (!healthObj) return { text: 'Not Analyzed', color: 'text-neutral-500', bg: 'bg-neutral-500/10' };

        // Check if there's any 'alert' in the dimensions
        let hasAlert = false;
        ['idea_clarity', 'evidence_strength', 'execution_readiness'].forEach(dim => {
            if (healthObj[dim] && Array.isArray(healthObj[dim])) {
                healthObj[dim].forEach((item: any) => {
                    if (item.status === 'alert') hasAlert = true;
                });
            }
        });

        if (hasAlert) return { text: 'Needs Info', color: 'text-amber-400', bg: 'bg-amber-500/10' };
        return { text: 'Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    };

    return (
        <div className="min-h-screen bg-nebula text-white font-sans p-8 pl-72 select-none overflow-x-hidden">
            <SidebarNav />
            {/* Header */}
            <div className="max-w-6xl mx-auto flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-3xl font-display font-medium tracking-tight mb-2">Execution Engine</h1>
                    <p className="text-neutral-400 text-sm">Transform your captures into completed projects.</p>
                </div>

                <div className="flex gap-4">
                    <ProfileManager />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
                    >
                        <Plus size={16} /> New Project
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-neutral-600" size={32} />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="max-w-3xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-900/10 to-black/40 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6">
                                    <Sparkles size={14} /> Getting Started
                                </div>
                                <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Your "Aha!" Moment Awaits</h2>
                                <p className="text-neutral-400 text-lg mb-10 max-w-xl leading-relaxed font-light">
                                    Stop organizing. Start executing. Complete these three steps to experience how NexusMind transforms your raw thoughts into finished projects.
                                </p>

                                <div className="space-y-4">
                                    {/* Step 1 */}
                                    <div className="group p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all flex items-start gap-4">
                                        <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-base font-medium text-emerald-100 mb-1">1. Capture Intelligence</h3>
                                            <p className="text-sm text-emerald-100/60 mb-3">You've successfully set up your NexusMind instance and accessed the platform.</p>
                                            <button onClick={() => router.push('/dashboard')} className="text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors">
                                                Go to Capture Stream
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="group p-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all flex items-start gap-4 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -skew-x-[30deg] translate-x-[-150%] animate-[hero-shine_4s_ease-in-out_infinite] pointer-events-none" />
                                        <Circle size={24} className="text-cyan-400 shrink-0 mt-0.5" />
                                        <div className="flex-1 relative z-10">
                                            <h3 className="text-base font-medium text-cyan-100 mb-1">2. Architect a Project</h3>
                                            <p className="text-sm text-cyan-100/60 mb-4">Create your first goal-oriented container to process your raw evidence into an execution blueprint.</p>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="text-sm font-medium text-black bg-cyan-400 hover:bg-cyan-300 px-5 py-2.5 rounded-xl shadow-[0_0_20px_-3px_cyan] hover:shadow-[0_0_30px_-3px_cyan] transition-all flex items-center gap-2"
                                            >
                                                <Plus size={16} /> Create First Project
                                            </button>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-start gap-4 opacity-60">
                                        <Circle size={24} className="text-neutral-700 shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-base font-medium text-neutral-300 mb-1">3. Daily Briefing</h3>
                                            <p className="text-sm text-neutral-500">Review your daily AI-generated execution plan once you have active projects to establish the habit loop.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -2 }}
                                onClick={() => router.push(`/projects/${project.id}`)}
                                className={`group relative p-6 glass-panel rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden flex flex-col h-full`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-cyan-500/10 transition-colors">
                                        <Folder size={18} className="text-neutral-400 group-hover:text-cyan-400" />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => deleteProject(project.id, e)}
                                            className="p-1.5 rounded-md hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-white mb-1 truncate">{project.name}</h3>
                                    <div className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                                        {project.objective || project.description || 'No objective defined'}
                                    </div>
                                </div>

                                {/* Quantitative Project Metrics */}
                                <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500 flex items-center gap-1"><Folder size={14} /> Evidence</span>
                                        <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded-md">{project.evidence_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-neutral-500 flex items-center gap-1"><Sparkles size={14} /> Next action</span>
                                        <span className="text-cyan-400 max-w-[140px] truncate text-right font-medium">{project.next_action || 'Pending'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                                        <span className="text-neutral-500 flex items-center gap-1"><Activity size={14} /> Health</span>
                                        {(() => {
                                            const status = getHealthStatus((project as any).health_score);
                                            return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${status.bg} ${status.color}`}>{status.text}</span>;
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <CreateProjectModal
                    onClose={() => setIsModalOpen(false)}
                    onProjectCreated={handleProjectCreated}
                />
            )}
        </div>
    );
}
