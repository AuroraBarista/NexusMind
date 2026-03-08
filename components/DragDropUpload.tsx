
"use client";

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
    onUploadComplete: () => void;
    projectContext?: string;
}

export function DragDropUpload({ onUploadComplete, projectContext }: DragDropUploadProps) {
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Debug: Check Env Vars
    useEffect(() => {
        console.log("DEBUG: Supabase Config Client-Side", {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
        });
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        setProgress(0);

        try {
            for (const file of acceptedFiles) {
                // 1. Upload file to Supabase Storage
                console.log("Attempting upload:", file.name, file.size, file.type);
                const fileExt = file.name.split('.').pop();
                const randomName = `${Date.now()}_${Math.random()}.${fileExt}`;
                const fileName = projectContext ? `${projectContext}/${randomName}` : randomName;

                const { data, error: uploadError } = await supabase.storage.from('uploads').upload(fileName, file);

                if (uploadError) {
                    console.error("Supabase Upload Error Raw:", uploadError);
                    console.error("Supabase Upload Error String:", JSON.stringify(uploadError));
                    throw uploadError;
                }

                console.log("Upload successful, data:", data);

                const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
                const fileUrl = publicUrlData.publicUrl;

                // 2. Get User & Insert into snippets
                const { data: { user } } = await supabase.auth.getUser();

                const { data: insertedSnippet, error: dbError } = await supabase.from('snippets').insert([{
                    content: `[FILE_UPLOAD] ${file.name}`,
                    project_anchor: projectContext || 'inbox',
                    type: 'file',
                    file_url: fileUrl,
                    status: 'processing',
                    user_id: user?.id
                }]).select().single();

                if (dbError) {
                    console.error("DB Insert Error:", dbError);
                    throw dbError;
                }

                console.log("Snippet created:", insertedSnippet.id);

                // 3. Trigger AI processing IMMEDIATELY
                fetch("/api/process-brain", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ snippetId: insertedSnippet.id })
                }).then(res => res.json())
                    .then(d => console.log("AI Triggered for Upload:", d))
                    .catch(e => console.error("AI Trigger failed:", e));
            }
            onUploadComplete();
        } catch (error: any) {
            console.error("Upload failed details:", error);
            let message = "Unknown error";
            if (error instanceof Error) {
                message = error.message;
            } else if (typeof error === "object" && error !== null) {
                message = error.message || error.error || JSON.stringify(error);
            } else if (typeof error === "string") {
                message = error;
            }
            alert(`Upload failed: ${message}`);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "group relative border border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer overflow-hidden",
                isDragActive ? "border-cyan-400 bg-cyan-900/20" : "border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.02]",
                "flex flex-col items-center justify-center gap-4 text-center glass-panel"
            )}
        >
            <input {...getInputProps()} />

            <div className={cn(
                "p-3 rounded-full bg-white/5 border border-white/10 shadow-lg shadow-black/20 transition-transform duration-300",
                isDragActive ? "scale-110 shadow-cyan-500/20" : "group-hover:scale-105"
            )}>
                <Upload size={20} className={cn("text-white/60 transition-colors", isDragActive && "text-cyan-400")} />
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-white/80 group-hover:text-cyan-200 transition-colors">
                    {isDragActive ? "Drop files here..." : "Drag & Drop or Click to Upload"}
                </p>
                <p className="text-xs text-white/40 font-light">
                    Images, PDFs, Documents
                </p>
            </div>

            {/* Progress Bar (Minimalist) */}
            {uploading && (
                <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 animate-pulse w-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
            )}
        </div>
    );
}
