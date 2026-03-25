"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        start: "top -50px",
        end: 99999,
        toggleClass: {
          className: "nav-scrolled",
          targets: navRef.current,
        },
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-[2rem] border border-transparent transition-all duration-300" ref={navRef}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center overflow-hidden">
            <div className="w-4 h-4 rounded-full bg-[#050505] shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          </div>
          <span className="font-display font-bold tracking-widest text-sm text-white uppercase">Seedflux</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white">Login</Link>
          <Link href="/login" className="group relative overflow-hidden bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#22d3ee]/20 transition-all flex items-center gap-2">
            <span>Start Engine</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
      <style jsx>{`
        .nav-scrolled {
          background-color: rgba(5, 5, 5, 0.6);
          backdrop-filter: blur(16px);
          border-color: rgba(255, 255, 255, 0.05);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
        }
      `}</style>
    </nav>
  );
}
