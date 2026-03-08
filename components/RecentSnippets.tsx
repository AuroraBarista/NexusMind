
import { Sparkles, Image as ImageIcon, Trash2, Clock, Hash, FileText, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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

interface RecentSnippetsProps {
    snippets: Snippet[];
    onDelete: (id: string) => void;
    onSelect: (snippet: Snippet) => void;
    onRetry?: (id: string) => void;
}

const getProjectLabel = (id: string) => {
    switch (id) {
        case "academic": return "ACADEMIC";
        case "social": return "CREATIVE";
        case "internship": return "WORK";
        case "inbox": return "INBOX";
        default: return "GENERAL";
    }
};

export function RecentSnippets({ snippets, onDelete, onSelect, onRetry }: RecentSnippetsProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Auto-clear confirmation after 3 seconds
    useEffect(() => {
        if (confirmDeleteId) {
            const timer = setTimeout(() => setConfirmDeleteId(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [confirmDeleteId]);

    return (
        <div className="w-full space-y-8">
            <div className="flex items-center gap-4 pl-1 opacity-60">
                <h2 className="text-[10px] font-sans tracking-[0.2em] uppercase text-white/50 font-medium">Incoming Intelligence</h2>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="columns-1 gap-6 space-y-6">
                {snippets.length === 0 ? (
                    <div className="glass-panel rounded-xl p-12 text-center text-white/40 font-light italic border-dashed border border-white/10 bg-white/5">
                        Feed empty. Waiting for signals...
                    </div>
                ) : (
                    snippets.map((snippet) => (
                        <div
                            key={snippet.id}
                            onClick={() => onSelect(snippet)}
                            className={cn(
                                "group relative break-inside-avoid overflow-hidden rounded-xl p-6 transition-all duration-700 cursor-pointer",
                                "glass-card hover:bg-white/10 border border-white/5 shadow-lg shadow-black/20 hover:shadow-cyan-500/10 hover:border-white/20"
                            )}
                        >
                            {/* Header: Project & Time */}
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-60 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></span>
                                    <span className="text-[10px] font-sans tracking-widest text-white/50 font-medium uppercase">
                                        {getProjectLabel(snippet.project_anchor)}
                                    </span>
                                </div>
                                <span className="text-[10px] font-sans text-white/30 flex items-center gap-1 font-light tracking-wide">
                                    <Clock size={10} />
                                    {snippet.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>

                            {/* Main Content */}
                            <div className="relative z-10 space-y-4">
                                {(() => {
                                    // SMART CONTENT PARSER
                                    const content = snippet.content || "";
                                    const isWebCapture = content.includes("[WEB_CAPTURE]");

                                    // 1. Web Capture View
                                    if (isWebCapture) {
                                        // regex to extract details: [WEB_CAPTURE] Title: ... URL: ...
                                        const titleMatch = content.match(/\[WEB_CAPTURE\]\s*(.*?)(?::\s*|$)/); // approximate title
                                        const urlMatch = content.match(/URL:\s*(https?:\/\/[^\s]+)/) || content.match(/(https?:\/\/[^\s]+)/); // approximate url

                                        // Clean description by removing the title/url parts - simple heuristic
                                        let cleanDescription = content
                                            .replace(/\[WEB_CAPTURE\]/, "")
                                            .replace(/URL:\s*https?:\/\/[^\s]+/, "")
                                            .replace(urlMatch ? urlMatch[1] : "", "")
                                            .trim();

                                        // If description is just the title repeating or empty, use fallback
                                        if (cleanDescription.length < 5) cleanDescription = "Web Link Captured";

                                        const title = titleMatch ? titleMatch[1] : "Web Resource";
                                        const url = urlMatch ? urlMatch[1] : "#";
                                        const domain = url !== "#" ? new URL(url).hostname.replace('www.', '') : "web";

                                        return (
                                            <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20 group/web">
                                                {/* Top Bar (Domain) */}
                                                <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1 rounded bg-blue-500/20 text-blue-300">
                                                            <Globe size={10} />
                                                        </div>
                                                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                                                            {domain}
                                                        </span>
                                                    </div>
                                                    <ExternalLink size={10} className="text-white/20 group-hover/web:text-white/60 transition-colors" />
                                                </div>

                                                {/* Card Body */}
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-white/5 transition-colors">
                                                    <h3 className="text-sm font-medium text-blue-100/90 leading-snug mb-2 group-hover/web:text-blue-300 transition-colors">
                                                        {title}
                                                    </h3>
                                                    <p className="text-[11px] text-white/40 font-light line-clamp-2 leading-relaxed">
                                                        {cleanDescription}
                                                    </p>

                                                    {/* URL Footer */}
                                                    <div className="mt-3 flex items-center gap-1 text-[9px] text-white/20 font-mono truncate">
                                                        <span className="opacity-50">SOURCE:</span>
                                                        <span className="text-blue-400/40">{url}</span>
                                                    </div>
                                                </a>
                                            </div>
                                        );
                                    }

                                    // 2. Standard Text View (Default)
                                    return (
                                        <p className="text-white/80 text-sm font-light leading-7 whitespace-pre-wrap font-sans">
                                            {snippet.content}
                                        </p>
                                    );
                                })()}

                                {/* Attachment Preview (Files/Images) - Kept mostly same but refined */}
                                {snippet.file_url && (
                                    <div className="mt-3">
                                        {snippet.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/20 group/image">
                                                <img
                                                    src={snippet.file_url}
                                                    alt="Attached Image"
                                                    className="w-full h-48 object-cover transition-transform duration-700 group-hover/image:scale-105 opacity-80 group-hover/image:opacity-100"
                                                />
                                                <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-md text-white/70 shadow-sm border border-white/10 opacity-0 group-hover/image:opacity-100 transition-opacity">
                                                    <ImageIcon size={14} />
                                                </div>
                                            </div>
                                        ) : (
                                            /* File Card */
                                            <a
                                                href={snippet.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group/file group/card"
                                            >
                                                <div className="p-2.5 bg-gradient-to-br from-white/5 to-white/0 rounded-md border border-white/5 shadow-sm text-white/60 group-hover/card:text-cyan-300 group-hover/card:border-cyan-500/20 transition-all">
                                                    <FileText size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-white/80 truncate group-hover/card:text-white transition-colors">
                                                        {snippet.content.replace('[FILE_UPLOAD] ', '') || "Document"}
                                                    </p>
                                                    <p className="text-[9px] text-white/40 uppercase tracking-wider font-sans mt-0.5 font-medium flex items-center gap-1.5">
                                                        <span>{snippet.file_url.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                                                        <span className="w-0.5 h-0.5 rounded-full bg-white/20"></span>
                                                        <span>ATTACHMENT</span>
                                                    </p>
                                                </div>
                                                <div className="text-white/20 group-hover/card:text-cyan-400 transition-colors">
                                                    <ExternalLink size={12} />
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* AI Analysis (Minimalist Style) */}
                                {snippet.is_processed && snippet.summary ? (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                <Sparkles size={12} className="text-cyan-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs text-white/60 italic leading-relaxed font-sans bg-cyan-900/10 border border-cyan-500/10 p-2 rounded">
                                                    {snippet.summary}
                                                </p>

                                                {/* Tags */}
                                                {snippet.ai_tags && snippet.ai_tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {snippet.ai_tags.map(tag => (
                                                            <span key={tag} className="text-[10px] font-sans text-cyan-200/40 px-1.5 py-0.5 border border-cyan-500/10 rounded hover:border-cyan-400/30 hover:bg-cyan-900/20 transition-colors tracking-wide">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Processing */
                                    ((snippet.status === "processing" || !snippet.is_processed) && snippet.status !== 'error') && (
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2 opacity-40 animate-pulse font-sans text-[10px] text-cyan-400 tracking-widest uppercase">
                                                <span className="w-1 h-3 bg-cyan-400 block animate-blink"></span>
                                                PROCESSING...
                                            </div>
                                            {/* Allow Retry if it seems stuck (> 10s old?) - For now just always show retry specifically for debugging */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRetry?.(snippet.id);
                                                }}
                                                className="text-[10px] text-cyan-500/50 hover:text-cyan-400 uppercase tracking-wider font-medium px-2 py-1 rounded border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )
                                )}

                                {/* Error State */}
                                {snippet.status === 'error' && (
                                    <div className="mt-4 pt-4 border-t border-red-500/10">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                <Sparkles size={12} className="text-red-400" />
                                            </div>
                                            <div className="space-y-2 w-full">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-red-200/60 font-medium font-sans">
                                                        PROCESSING FAILED
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onRetry?.(snippet.id);
                                                        }}
                                                        className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-wider font-medium"
                                                    >
                                                        RETRY
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-red-200/40 italic leading-relaxed font-sans bg-red-900/10 border border-red-500/10 p-2 rounded">
                                                    {snippet.summary || "Unknown error occurred."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirmDeleteId === snippet.id) {
                                        onDelete(snippet.id);
                                        setConfirmDeleteId(null);
                                    } else {
                                        setConfirmDeleteId(snippet.id);
                                    }
                                }}
                                className={cn(
                                    "absolute bottom-4 right-4 p-2 transition-all duration-300 z-20 rounded-md",
                                    confirmDeleteId === snippet.id
                                        ? "text-red-400 bg-red-900/20 hover:bg-red-900/40 scale-110"
                                        : "text-white/20 hover:text-white/80 hover:bg-white/5 opacity-0 group-hover:opacity-100"
                                )}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
