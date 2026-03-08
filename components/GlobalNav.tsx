"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Brain, Sparkles, LayoutGrid } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export function GlobalNav() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop & Mobile Top Bar (Logo & Status) */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 md:py-6 pointer-events-none">
                {/* Logo Area */}
                <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
                    <h1 className="text-lg md:text-xl tracking-[0.2em] text-white/90 font-display select-none">
                        <span className="font-light opacity-60">NEXUS</span>
                        <span className="font-medium ml-1">MIND</span>
                    </h1>
                </div>

                {/* Center Switcher (Desktop Only) */}
                <div className="hidden md:flex pointer-events-auto bg-black/40 backdrop-blur-md rounded-full border border-white/10 p-1 items-center gap-1 shadow-xl">
                    <NavLink href="/dashboard" icon={<LayoutGrid size={14} />} label="Capture" active={pathname === "/dashboard"} variant="default" />
                    <NavLink href="/summary" icon={<Brain size={14} />} label="Synthesis" active={pathname === "/summary"} variant="cyan" />
                    <NavLink href="/projects" icon={<Sparkles size={14} />} label="Anchors" active={pathname === "/projects"} variant="purple" />
                </div>

                {/* Right Status */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-sans opacity-50 tracking-widest text-cyan-400 uppercase font-medium glow-cyan">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-sm shadow-cyan-500" />
                        ONLINE
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-white/10" />
                    <LogoutButton />
                </div>
            </div>

            {/* Mobile Bottom Navigation (Visible only on small screens) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[calc(100%-2rem)] max-w-sm pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-1.5 flex items-center justify-around shadow-2xl">
                    <MobileNavLink href="/dashboard" icon={<LayoutGrid size={20} />} label="Capture" active={pathname === "/dashboard"} />
                    <MobileNavLink href="/summary" icon={<Brain size={20} />} label="Synthesis" active={pathname === "/summary"} />
                    <MobileNavLink href="/projects" icon={<Sparkles size={20} />} label="Anchors" active={pathname === "/projects"} />
                </div>
            </div>
        </>
    );
}

function NavLink({ href, icon, label, active, variant = "default" }: { href: string, icon: React.ReactNode, label: string, active: boolean, variant?: string }) {
    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300",
                active
                    ? variant === "cyan" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 shadow-[0_0_15px_-5px_cyan]"
                        : variant === "purple" ? "bg-purple-500/20 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_-5px_purple]"
                            : "bg-white/10 text-white shadow-inner"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}>
                {icon}
                <span className="tracking-wide uppercase">{label}</span>
            </div>
        </Link>
    );
}

function MobileNavLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <Link href={href} className="flex-1">
            <div className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-300",
                active ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-white/40"
            )}>
                {icon}
                <span className="text-[10px] font-medium uppercase tracking-tighter">{label}</span>
            </div>
        </Link>
    );
}
