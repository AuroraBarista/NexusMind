"use client";

import { useState } from "react";
import { X, Upload, Loader2, FileText, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ArchitectWindow } from "./ArchitectWindow"; // Import Architect

interface CreateProjectModalProps {
    onClose: () => void;
    onProjectCreated: (name: string) => void;
}

export function CreateProjectModal({ onClose, onProjectCreated }: CreateProjectModalProps) {
    const supabase = createClient();
    const [name, setName] = useState("");
    const [goal, setGoal] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string>("");

    // Architect State
    const [showArchitect, setShowArchitect] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        setStatus("Initializing...");

        try {
            let fileUrl = null;

            // 1. Upload File if exists
            if (file) {
                setStatus("Uploading context...");
                const fileExt = file.name.split('.').pop();
                const fileName = `project-context/${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
                fileUrl = data.publicUrl;
            }

            // 2. Call API to create project and extract text
            setStatus(file ? "Analyzing requirements..." : "Creating project...");

            const res = await fetch('/api/create-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    goal,
                    fileUrl,
                    fileName: file?.name
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create project");
            }

            // Instead of closing, switch to Architect Mode
            setStatus("Launching Architect...");
            setTimeout(() => {
                setShowArchitect(true);
                setIsSubmitting(false);
                // We call onProjectCreated but don't close yet
                onProjectCreated(name);
            }, 100);

        } catch (error: any) {
            console.error("Creation Error:", error);
            setStatus(`Error: ${error.message}`);
            setIsSubmitting(false);
            // Don't close or anything, let user see error
        }
    };

    if (showArchitect) {
        return (
            <ArchitectWindow
                projectName={name}
                initialGoal={goal}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-lg font-display font-medium text-white tracking-tight">Initialize Project</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-cyan-400">Project Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Q3 Market Analysis"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-white/20"
                            autoFocus
                        />
                    </div>

                    {/* Goal */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-cyan-400">Objective</label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="What is your main goal? (e.g., 'Analyze the competitive landscape...')"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-white/20 min-h-[100px] resize-none"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center justify-between">
                            <span>Context (Optional)</span>
                            {file && <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Ready</span>}
                        </label>

                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${file ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-cyan-500/30 hover:bg-white/5'
                                }`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,.txt,.md,.doc,.docx"
                            />

                            {file ? (
                                <div className="flex items-center justify-center gap-3 text-green-300">
                                    <FileText size={20} />
                                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                </div>
                            ) : (
                                <div className="text-white/40 space-y-2 pointer-events-none">
                                    <Upload size={20} className="mx-auto text-cyan-500/50" />
                                    <p className="text-xs">
                                        Drop rubric or requirements here
                                        <br />
                                        <span className="opacity-50 text-[10px]">PDF, DOCX, TXT</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-2">
                        {status.startsWith("Error:") && (
                            <p className="text-xs text-red-400 mb-2 text-center">{status}</p>
                        )}
                        <button
                            type="submit"
                            disabled={!name.trim() || isSubmitting}
                            className={`w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${!name.trim() || isSubmitting
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    {status.startsWith("Error") ? "Failed" : status}
                                </>
                            ) : (
                                "Initiate Project"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
