import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

export interface Anchor {
    id: string;
    name: string; // "Academic"
    color: string;
}

interface ProjectAnchorBarProps {
    activeProject: string | null;
    anchors: Anchor[];
    onSelect: (id: string) => void;
    onAddClick: () => void;
}

export function ProjectAnchorBar({ activeProject, anchors, onSelect, onAddClick }: ProjectAnchorBarProps) {
    return (
        <div className="flex items-center gap-1">
            {anchors.map((project) => {
                const isActive = activeProject === project.name;

                return (
                    <button
                        key={project.id}
                        onClick={() => onSelect(project.name)}
                        className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-sans font-medium uppercase tracking-wide transition-all duration-300 border",
                            isActive
                                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-100 font-medium shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                : "bg-transparent border-transparent text-white/40 hover:text-white hover:bg-white/5"
                        )}
                    >
                        {project.name}
                    </button>
                );
            })}

            {/* Add Project Button - Opens Modal */}
            <button
                onClick={onAddClick}
                className="ml-2 p-1.5 rounded-full text-white/20 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-transparent hover:border-white/10"
                title="Initialize New Project"
            >
                <Plus size={14} />
            </button>
        </div>
    );
}
