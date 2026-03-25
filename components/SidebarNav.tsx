"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, LayoutGrid, Coffee, Settings, CircuitBoard, PlusSquare } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export function SidebarNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <div className="fixed top-0 left-0 h-screen w-64 bg-[#050505] border-r border-white/5 flex flex-col z-50 pointer-events-auto">
            {/* Logo Area */}
            <div className="px-6 py-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center overflow-hidden shrink-0">
                    <div className="w-4 h-4 rounded-full bg-[#050505] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                </div>
                <span className="font-semibold tracking-widest text-sm text-white uppercase">SEEDFLUX</span>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col gap-1 px-4 mt-4">
                <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">{t("Menu")}</div>
                <NavLink href="/dashboard" icon={<LayoutGrid size={16} />} label={t("Capture")} active={pathname === "/dashboard"} />
                <NavLink href="/projects" icon={<Sparkles size={16} />} label={t("Projects")} active={pathname.startsWith("/projects")} />
                <NavLink href="/briefing" icon={<Coffee size={16} />} label={t("Daily Briefing")} active={pathname === "/briefing"} />

                <div className="mt-8 px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Connect</div>
                <a
                    href="https://drive.google.com/drive/folders/1KzgpLtHtZy-j6-vQbUt9nS9GwGVlw39N?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-all duration-200 mt-1 cursor-pointer w-full text-left"
                >
                    <PlusSquare size={16} />
                    <span className="tracking-tight text-xs">Install Extension</span>
                </a>
            </div>

            {/* Bottom Status & Logout */}
            <div className="p-6 mt-auto border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                    <LanguageToggle />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-neutral-400 uppercase">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        {t("Online")}
                    </div>
                    <LogoutButton />
                </div>
            </div>
        </div>
    );
}

function NavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                    ? "bg-white/[0.08] text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
            )}>
                <div className={cn("opacity-70", active && "opacity-100 text-[#22d3ee]")}>
                    {icon}
                </div>
                <span className="tracking-tight">{label}</span>
            </div>
        </Link>
    );
}
