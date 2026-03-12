"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Sparkles, LayoutGrid, CircuitBoard, Coffee, Activity, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(99,102,241,0.5)]">
            <CircuitBoard className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold tracking-widest text-sm text-white/90 uppercase">NexusMind</span>
        </div>

        <div className="flex items-center gap-6 pointer-events-auto">
          <Link href="#pricing" className="text-xs font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors hidden md:block">
            Pricing
          </Link>
          <a href="https://drive.google.com/drive/folders/1KzgpLtHtZy-j6-vQbUt9nS9GwGVlw39N?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold tracking-widest uppercase text-cyan-400 hover:text-cyan-300 transition-colors hidden flex-row items-center gap-2 md:flex cursor-pointer">
            <Download size={14} /> Add to Chrome
          </a>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold tracking-widest uppercase text-white/80 hover:text-white"
          >
            Login / Signup
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cyan-300 font-medium">The Second Brain Curator</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-medium tracking-tight mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Stop Organizing.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]">Start Executing.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            You save hundreds of links, notes, and screenshots, only to let them die in folders. NexusMind automatically connects your raw ideas and tells you exactly what to do next.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all flex items-center gap-3"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start 7-Day Free Trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="https://drive.google.com/drive/folders/1KzgpLtHtZy-j6-vQbUt9nS9GwGVlw39N?usp=sharing" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest text-white flex items-center gap-3 cursor-pointer">
                <Download size={16} className="text-cyan-400" /> Add to Chrome — It's Free
              </a>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* How It Works */}
      <section className="px-6 max-w-7xl mx-auto py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">How NexusMind turns noise into momentum.</h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <Zap className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-xl font-display text-white mb-3">Zero-Friction Capture</h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-light">
              Stop worrying about folders or tags. Use the Chrome extension to capture links, text, and images instantly. Just dump it in—NexusMind handles the rest.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30 relative z-10">
              <Target className="text-cyan-400" size={24} />
            </div>
            <h3 className="text-xl font-display text-white mb-3 relative z-10">The Project State Machine</h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-light relative z-10">
              As you feed it information, NexusMind automatically links related ideas, visualizes connections, and advances your projects from "Idea" to "Build" without you touching an organize button.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
              <Coffee className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-display text-white mb-3">Executive Daily Briefings</h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-light">
              Never wonder where to start. Every morning, get an AI-generated report detailing your project momentum and the single, highest-leverage task you need to execute today.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 max-w-5xl mx-auto py-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-6">Invest in Execution.</h2>
          <p className="text-neutral-400 text-lg">Choose the plan that fits your momentum.</p>

          <div className="mt-8 inline-flex items-center p-1 bg-white/5 rounded-full border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${!isAnnual ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isAnnual ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
            >
              Annually <span className="text-[10px] text-green-500 ml-1">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col">
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2 block">Free Trial</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-medium text-white">$0</span>
                <span className="text-neutral-500 text-sm">/ 7 days</span>
              </div>
              <p className="text-sm text-neutral-400 mt-4 h-10">Experience the friction-free capture and automated curation.</p>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {[
                "Full access to Project State Machine",
                "10 AI Daily Briefings",
                "Chrome Extension Capture",
                "Visual Knowledge Nebula"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-cyan-500/70" />
                  <span className="text-sm text-neutral-300 font-light">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="w-full py-4 text-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-sm font-bold uppercase tracking-widest text-white"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-900/20 to-black/40 backdrop-blur-xl flex flex-col relative overflow-hidden shadow-[0_0_50px_-15px_rgba(6,182,212,0.2)]">
            <div className="absolute top-0 right-0 px-4 py-1 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-bl-lg">
              Most Popular
            </div>

            <div className="mb-8 mt-2">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block">Nexus Pro</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-medium text-white">${isAnnual ? '12' : '15'}</span>
                <span className="text-neutral-500 text-sm">/ month</span>
              </div>
              <p className="text-sm text-neutral-400 mt-4 h-10">For professionals who need unlimited capacity to execute.</p>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                <Sparkles size={16} className="text-cyan-400" />
                <span className="text-sm text-white font-medium">Everything in Trial, plus:</span>
              </div>
              {[
                "Unlimited AI Daily Briefings",
                "Unlimited Project Nodes",
                "Smart Gap Analysis",
                "Priority Support"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  <span className="text-sm text-neutral-200 font-light">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="w-full py-4 text-center rounded-full bg-white text-black hover:bg-gray-100 transition-colors text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/10 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">
            Your ideas deserve to see the light of day.
          </h2>
          <p className="text-lg text-neutral-400 mb-12 font-light max-w-xl mx-auto">
            Stop letting your best thoughts rot in a notes app. Start executing today and turn your ideas into launched reality.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link
              href="/login"
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-sm font-bold uppercase tracking-widest rounded-full overflow-hidden shadow-[0_0_40px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-5px_rgba(6,182,212,0.6)] transition-all inline-block"
            >
              Start Free Trial Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/40 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <CircuitBoard size={16} />
            <span className="text-xs font-mono tracking-widest uppercase">NexusMind Intelligence</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-mono">Terms</Link>
            <Link href="/privacy" className="text-[10px] text-neutral-500 hover:text-white uppercase tracking-widest font-mono">Privacy</Link>
          </div>
          <p className="text-[10px] text-neutral-600 font-mono">
            © 2026. All systems nominal.
          </p>
        </div>
      </footer>
    </div>
  );
}
