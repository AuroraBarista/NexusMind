"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// A simple dictionary for UI strings. 
// Keys represent English default values.
const dictionary = {
    "Daily Briefing": { en: "Daily Briefing", zh: "每日晨报" },
    "Projects": { en: "Projects", zh: "项目广场" },
    "Capture": { en: "Capture", zh: "意念捕获" },
    "Settings": { en: "Settings", zh: "系统设置" },
    "Menu": { en: "MENU", zh: "功能导航" },
    "Online": { en: "ONLINE", zh: "神经在线" },
    "Refresh Analysis": { en: "Refresh Analysis", zh: "重新分析" },
    "AI Intelligence Report": { en: "AI INTELLIGENCE REPORT", zh: "AI 情报简报" },
    "Progress Summary": { en: "PROGRESS SUMMARY", zh: "战况纪要" },
    "Today's Focus Action": { en: "TODAY'S FOCUS ACTION", zh: "今日绝杀行动" },
    "Acknowledge & Start": { en: "Acknowledge & Start", zh: "确认并开始" },
    "What Went Well": { en: "WHAT WENT WELL", zh: "高光与里程碑" },
    "Needs Attention": { en: "NEEDS ATTENTION", zh: "沉寂警报" },
    "Strategic Improvements": { en: "STRATEGIC IMPROVEMENTS", zh: "破局策略" },
    "Create Project": { en: "Create Project", zh: "建立项目组" },
    "Active Projects": { en: "Active Projects", zh: "活跃项目" },
    "Synthesizing...": { en: "Synthesizing...", zh: "意识深潜中..." },
    "No Active Intelligence": { en: "No Active Intelligence", zh: "尚未截获情报" }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("nexus_lang") as Language;
        if (stored === "en" || stored === "zh") {
            setLanguageState(stored);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("nexus_lang", lang);
    };

    const t = (key: string): string => {
        if (!mounted) return key; // Prevent hydration mismatch
        const entry = dictionary[key as keyof typeof dictionary];
        return entry ? entry[language] : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
