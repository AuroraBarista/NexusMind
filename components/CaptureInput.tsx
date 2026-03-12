"use client";

import { useState, KeyboardEvent, useRef, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, Image as ImageIcon, Link as LinkIcon, Mic, X, ArrowRight, Command } from "lucide-react";

interface CaptureInputProps {
    onCapture: (content: string, file: File | null) => void;
}

export function CaptureInput({ onCapture }: CaptureInputProps) {
    const [value, setValue] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && (value.trim() || file)) {
            onCapture(value.trim(), file);
            setValue("");
            setFile(null);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleProFeature = () => {
        alert("Feature in development");
    };

    const handleCaptureClick = () => {
        if (value.trim() || file) {
            onCapture(value.trim(), file);
            setValue("");
            setFile(null);
        }
    }

    return (
        <div className="w-full relative group">
            {/* Subtle Spotlight Effect instead of gradient */}
            <div
                className={cn(
                    "absolute -inset-px rounded-xl bg-cyan-500/10 blur-md transition-opacity duration-500",
                    isFocused ? "opacity-100" : "opacity-0"
                )}
            />

            <div className="relative flex flex-col gap-2">
                <div className="relative flex items-center">
                    <div className={cn(
                        "absolute left-5 transition-colors duration-300",
                        isFocused || value ? "text-cyan-400" : "text-white/20"
                    )}>
                        <Command size={22} />
                    </div>

                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder={file ? "Add context to attachment..." : "Enter command or capture thought..."}
                        className={cn(
                            "w-full glass-input text-white placeholder:text-white/30 tracking-wide",
                            "rounded-2xl pl-14 pr-32 py-6 text-base md:text-lg font-sans outline-none transition-all duration-300",
                            "hover:bg-white/[0.06] focus:bg-white/[0.1] border-white/10 focus:border-cyan-500/30 shadow-2xl"
                        )}
                    />

                    <div className="absolute right-4 flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {!value && !file && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all"
                                    title="Attach Image/File"
                                >
                                    <ImageIcon size={18} />
                                </button>
                                <button onClick={handleProFeature} className="p-2.5 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all">
                                    <Mic size={18} />
                                </button>
                            </>
                        )}

                        {/* Separator */}
                        <div className="w-px h-5 bg-white/10 mx-1"></div>

                        <button
                            onClick={handleCaptureClick}
                            className={cn(
                                "p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2",
                                value || file
                                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                                    : "text-white/10 cursor-default"
                            )}
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* File Preview Pill */}
                {file && (
                    <div className="absolute -top-10 left-0 flex items-center gap-2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white animate-in fade-in slide-in-from-bottom-1 shadow-xl">
                        <ImageIcon size={12} />
                        <span className="max-w-[150px] truncate font-mono">{file.name}</span>
                        <button onClick={clearFile} className="ml-2 text-white/40 hover:text-white transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
