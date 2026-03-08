"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, LayoutGrid, Coffee, Settings, CircuitBoard } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export function SidebarNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-black/60 backdrop-blur-xl border-r border-white/5 flex flex-col z-50 pointer-events-auto shadow-2xl">
            {/* Logo Area */}
            <div className="px-8 py-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex flex-shrink-0 items-center justify-center shadow-[0_0_15px_-3px_rgba(6,182,212,0.6)]">
                    <CircuitBoard className="text-white w-5 h-5" />
                </div>
                <h1 className="text-xl tracking-[0.2em] text-white/90 font-display select-none">
                    <span className="font-light opacity-60">NEXUS</span>
                    <span className="font-medium ml-1">MIND</span>
                </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col gap-2 px-4 mt-8">
                <div className="px-4 mb-2 text-[10px] font-mono uppercase tracking-widest text-white/30">{t("Menu")}</div>
                <NavLink href="/dashboard" icon={<LayoutGrid size={18} />} label={t("Capture")} active={pathname === "/dashboard"} variant="cyan" />
                <NavLink href="/projects" icon={<Sparkles size={18} />} label={t("Projects")} active={pathname.startsWith("/projects")} variant="purple" />
                <NavLink href="/briefing" icon={<Coffee size={18} />} label={t("Daily Briefing")} active={pathname === "/briefing"} variant="cyan" />
                <NavLink href="#" icon={<Settings size={18} />} label={t("Settings")} active={pathname === "/settings"} variant="default" />
            </div>

            {/* Bottom Status & Logout */}
            <div className="p-6 mt-auto border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <LanguageToggle />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-sans opacity-50 tracking-widest text-cyan-400 uppercase font-medium glow-cyan">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-sm shadow-cyan-500" />
                        {t("Online")}
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}

function NavLink({ href, icon, label, active, variant = "default" }: { href: string, icon: React.ReactNode, label: string, active: boolean, variant?: string }) {
    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                active
                    ? variant === "cyan" ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_-5px_cyan]"
                        : variant === "purple" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_-5px_purple]"
                            : "bg-white/10 text-white shadow-inner border border-white/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
            )}>
                {icon}
                <span className="tracking-wide">{label}</span>
            </div>
        </Link>
    );
}
