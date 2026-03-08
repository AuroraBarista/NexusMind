
import { useState, useEffect } from "react";
import { X, Upload, Loader2, FileText, CheckCircle, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface EditProjectModalProps {
    project: {
        id: string;
        name: string;
        goal_description?: string;
        requirements_doc?: any;
    };
    onClose: () => void;
    onProjectUpdated: () => void;
}

export function EditProjectModal({ project, onClose, onProjectUpdated }: EditProjectModalProps) {
    const supabase = createClient();
    const [goal, setGoal] = useState(project.goal_description || "");
    const [file, setFile] = useState<File | null>(null);
    const [currentFile, setCurrentFile] = useState<string | null>(
        project.requirements_doc?.file_name || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string>("");

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

    const handleDeleteCurrentFile = () => {
        if (confirm("Are you sure you want to remove the current requirements document?")) {
            setCurrentFile(null);
            setFile(null);
        }
    };

    const handleDeleteProject = async () => {
        if (confirm(`Are you sure you want to PERMANENTLY delete the project "${project.name}"? This cannot be undone.`)) {
            setIsSubmitting(true);
            setStatus("Deleting...");
            try {
                const res = await fetch('/api/delete-project', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectName: project.name })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to delete project");
                }

                alert("Project deleted successfully.");
                window.location.reload(); // Hard reload to refresh state completely
            } catch (error: any) {
                console.error("Delete Error:", error);
                setStatus(`Error: ${error.message}`);
                setIsSubmitting(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus("Updating...");

        try {
            let fileUrl = null;
            let fileName = currentFile;

            // 1. Upload New File if selected
            if (file) {
                setStatus("Uploading new context...");
                const fileExt = file.name.split('.').pop();
                const storageName = `project-context/${Date.now()}_${project.name.replace(/\s+/g, '_')}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(storageName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('uploads').getPublicUrl(storageName);
                fileUrl = data.publicUrl;
                fileName = file.name;
            }

            // 2. Update Project via API (handles text extraction + DB update)
            setStatus("Processing updates...");

            const res = await fetch('/api/update-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: project.name, // Use name as ID for now or pass actual ID if needed
                    goal,
                    fileUrl,
                    fileName,
                    removeFile: !file && !currentFile // Explicit flag if file is removed
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to update project");
            }

            setStatus("Success!");
            onProjectUpdated();
            onClose();

        } catch (error: any) {
            console.error("Update Error:", error);
            setStatus(`Error: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-lg font-display font-medium text-white tracking-tight">Edit Project: {project.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Goal */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-cyan-400">Objective</label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Update project goal..."
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-white/20 min-h-[100px] resize-none"
                        />
                    </div>

                    {/* File Upload / Management */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center justify-between">
                            <span>Context Document</span>
                        </label>

                        {currentFile && !file ? (
                            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                                <div className="flex items-center gap-3 text-cyan-300 overflow-hidden">
                                    <FileText size={18} className="shrink-0" />
                                    <span className="text-sm truncate">{currentFile}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDeleteCurrentFile}
                                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                    title="Remove file"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
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
                                            Click or drop to replace <br /> current document
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-2 flex justify-between items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDeleteProject}
                            className="px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 border border-transparent hover:border-red-500/20"
                            title="Delete Project Permanently"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>

                        <div className="flex gap-3 flex-1 justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-lg font-medium text-sm bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {status}
                                    </>
                                ) : (
                                    "Update Project"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
