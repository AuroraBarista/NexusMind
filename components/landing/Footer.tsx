"use client";

import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-transparent border-t border-white/[0.04] pt-24 pb-12 px-6 md:px-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center overflow-hidden">
                <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />
              </div>
              <span className="font-semibold tracking-tight text-lg text-white">Seedflux</span>
            </div>
            <p className="text-neutral-500 text-sm max-w-xs font-light mb-8">
              The momentum engine for independent developers. Stop organizing links. Start shipping products.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all">
                <Twitter size={16} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-neutral-300 font-medium text-sm mb-2">Product</h4>
            <Link href="#features" className="text-neutral-500 text-sm hover:text-white transition-colors">Features</Link>
            <Link href="#protocol" className="text-neutral-500 text-sm hover:text-white transition-colors">Protocol</Link>
            <Link href="#pricing" className="text-neutral-500 text-sm hover:text-white transition-colors">Pricing</Link>
            <Link href="/download" className="text-neutral-500 text-sm hover:text-white transition-colors">Terminal</Link>
          </div>

          {/* Links Col 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-neutral-300 font-medium text-sm mb-2">Legal</h4>
            <Link href="/privacy" className="text-neutral-500 text-sm hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-neutral-500 text-sm hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:hello@seedflux.com" className="text-neutral-500 text-sm hover:text-white transition-colors">Contact Us</a>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.02]">
          <p className="text-neutral-600 text-xs">
            © {new Date().getFullYear()} Seedflux Inc. All rights reserved.
          </p>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">All Systems Nominal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
