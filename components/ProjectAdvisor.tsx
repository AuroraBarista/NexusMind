
import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { ZoneRoadmap } from "./advisor/ZoneRoadmap";
import { ZoneGapAnalysis } from "./advisor/ZoneGapAnalysis";
import { ZoneEvidence } from "./advisor/ZoneEvidence";
import { ZoneSocratic } from "./advisor/ZoneSocratic";
import { ZoneBlueprint } from "./advisor/ZoneBlueprint";

interface ProjectAdvisorProps {
    projectName: string;
}

export function ProjectAdvisor({ projectName }: ProjectAdvisorProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async (skipCache = false) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/analyze-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectName, skipCache }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to analyze project");
            }

            const result = await res.json();
            setData(result.analysis);
        } catch (e: any) {
            console.error(e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectName) {
            fetchAnalysis();
        }
    }, [projectName]);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-500">
                <Loader2 className="animate-spin mb-4 text-cyan-500" size={32} />
                <p className="text-sm font-mono animate-pulse">Consulting Neural Core...</p>
                <div className="mt-2 text-xs text-neutral-600">Analyzing patterns across {projectName}</div>
            </div>
        );
    }

    if (error) {
        const isNotFound = error.includes("not found");
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-neutral-400 text-center">
                <div className="mb-4 p-4 bg-red-500/10 rounded-full text-red-400 border border-red-500/20">
                    <Loader2 size={32} className="opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Analysis Interrupted</h3>
                <p className="max-w-md text-sm mb-6">
                    {isNotFound
                        ? `The project context for "${projectName}" could not be retrieved. Please ensure it is initialized.`
                        : error}
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => fetchAnalysis(true)}
                        className="px-6 py-2 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors"
                    >
                        Retry Analysis
                    </button>
                    {isNotFound && (
                        <p className="text-xs text-neutral-500 mt-2">
                            Tip: Try editing the project settings to re-save the goal.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Header / Refresh */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-white tracking-tight">
                    Project Advisor
                </h2>
                <button
                    onClick={() => fetchAnalysis(true)}
                    className="p-2 rounded-full hover:bg-white/5 text-neutral-500 hover:text-cyan-400 transition-colors"
                    title="Refresh Analysis"
                >
                    <RefreshCw size={14} />
                </button>
            </div>

            {/* Zone 0: Strategic Blueprint (From Architect) */}
            {data.execution_plan ? (
                <ZoneBlueprint plan={data.execution_plan} />
            ) : (
                <div className="p-6 rounded-2xl bg-[#0a0f1c] border border-white/5 border-dashed flex flex-col items-center justify-center text-center space-y-2 opacity-60">
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No Blueprint Found</p>
                    <p className="text-xs text-neutral-600">
                        Use the Architect to design and save an execution plan.<br />
                        (Click the project name in the dashboard to open Architect)
                    </p>
                </div>
            )}

            {/* Zone C: Evidence Board (List View) */}
            <ZoneEvidence items={data.item_analysis} narrative={data.synthesized_narrative} />

            {/* Zone Gap: Actionable AI Recommendations */}
            <ZoneGapAnalysis gaps={data.gap_analysis} />

            {/* Zone D: Socratic */}
            <ZoneSocratic question={data.socratic_question} />
        </div>
    );
}
