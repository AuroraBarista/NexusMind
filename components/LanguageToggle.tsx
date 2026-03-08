"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-full p-1 backdrop-blur-md">
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-widest transition-all ${language === "en"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_-2px_rgba(6,182,212,0.3)]"
                        : "text-neutral-500 hover:text-neutral-300 transparent border border-transparent"
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage("zh")}
                className={`px-3 py-1 rounded-full text-[10px] font-mono tracking-widest transition-all ${language === "zh"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_-2px_rgba(168,85,247,0.3)]"
                        : "text-neutral-500 hover:text-neutral-300 transparent border border-transparent"
                    }`}
            >
                中文
            </button>
        </div>
    );
}
