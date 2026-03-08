"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Target, Sparkles, LayoutGrid, CircuitBoard, Coffee, Activity } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nebula text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(6,182,212,0.6)]">
            <CircuitBoard className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold tracking-widest text-sm text-white/90 uppercase">NexusMind</span>
        </div>
        <Link
          href="/login"
          className="pointer-events-auto px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.3)] transition-all text-xs font-bold tracking-widest uppercase text-white/80 hover:text-white"
        >
          Login / Signup
        </Link>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        {/* Fine grid overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-cyan-300 font-medium">Daily Briefing V2 Online</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-display font-medium tracking-tight mb-6 leading-[1.1]">
            <span className="hero-gradient-text">Stop Organizing.</span><br />
            <span className="nebula-gradient-text text-glow">Start Executing.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            NexusMind automatically processes your ideas, builds connection trees, and generates an <span className="text-white font-medium">executive-level Daily Briefing</span> to tell you exactly what your Next Action should be.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-full overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.6)] transition-all flex items-center gap-3"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Access Your Matrix <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-white to-cyan-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase opacity-70">
                Secure Authentication Environment
              </span>
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* Features - Bento Grid */}
      <section className="px-6 max-w-7xl mx-auto pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Daily Briefing (Wide) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-2 glass-card p-8 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-end h-full">
              <div className="flex-1">
                <div className="mb-6 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]">
                  <Coffee className="text-cyan-200" size={20} />
                </div>
                <h3 className="text-xl font-display font-medium text-white mb-2">Automated Morning Briefing</h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-sm font-light">
                  Wake up to an AI-generated report highlighting your <span className="text-white">momentum</span>, what needs attention, and the exact <span className="text-cyan-400">Next Action</span> for today.
                </p>
              </div>

              {/* Visual representation - Dashboard Module */}
              <div className="flex-1 w-full bg-black/40 rounded-xl p-5 border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={14} className="text-cyan-400" />
                  <span className="text-[10px] uppercase text-cyan-400 font-mono tracking-widest">Progress Summary</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-white/10 rounded-full" />
                  <div className="h-2 w-5/6 bg-white/5 rounded-full" />
                  <div className="h-2 w-3/4 bg-white/5 rounded-full" />
                </div>
                <div className="mt-6 pt-3 border-t border-cyan-500/20">
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Start Next Action</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Inbox Curation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="col-span-1 glass-card p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
              <Zap size={120} />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="mb-6 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_-5px_rgba(249,115,22,0.3)]">
                <Zap className="text-orange-200" size={20} />
              </div>
              <h3 className="text-xl font-display font-medium text-white mb-2">Rich Inbox Curation</h3>
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                Our new rich snippet rendering engine fetches domain info, titles, and perfectly formats your web captures.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Project Engine (Wide) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="col-span-1 md:col-span-2 glass-card p-8 group relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row-reverse gap-12 items-end h-full">
              <div className="flex-1 text-right md:text-left">
                <div className="mb-6 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center ml-auto md:ml-0 transform group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]">
                  <Target className="text-purple-200" size={20} />
                </div>
                <h3 className="text-xl font-display font-medium text-white mb-2">Project State Machine</h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-sm ml-auto md:ml-0 font-light">
                  Projects advance autonomously through <span className="text-white">Stages</span> (Idea → Validation → Build) strictly based on the deep evidence you feed them.
                </p>
              </div>

              {/* Visual representation - Stage Indicators */}
              <div className="flex-1 w-full bg-black/40 rounded-xl p-6 border border-white/10 backdrop-blur-md relative mx-auto md:mx-0">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-purple-400" />
                  <span className="text-[10px] uppercase text-purple-400 font-mono tracking-widest">Active Stage</span>
                </div>

                <div className="flex items-center gap-1.5 w-full">
                  <div className="h-1 flex-1 bg-purple-500 rounded-full" />
                  <div className="h-1 flex-1 bg-purple-500/50 rounded-full" />
                  <div className="h-1 flex-1 bg-white/10 rounded-full" />
                  <div className="h-1 flex-1 bg-white/10 rounded-full" />
                </div>
                <div className="flex justify-between w-full mt-2 text-[8px] font-mono text-white/40 uppercase">
                  <span>Idea</span>
                  <span className="text-purple-300">Validating</span>
                  <span>Build</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Action Bias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="col-span-1 glass-card p-8 group relative overflow-hidden flex flex-col justify-center items-center text-center"
          >
            <div className="mb-6 p-4 bg-white/5 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500 group-hover:bg-white/10 group-hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]">
              <LayoutGrid className="text-white/80" size={32} />
            </div>
            <h3 className="text-lg font-display font-medium text-white mb-2">Zero Friction Strategy</h3>
            <p className="text-xs text-neutral-400 max-w-[200px] font-light">
              Stop organizing tabs and folders. Dump raw links and let the engine derive strategy.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <CircuitBoard size={16} />
            <span className="text-xs font-mono tracking-widest uppercase">NexusMind Intelligence</span>
          </div>
          <p className="text-[10px] text-neutral-600 font-mono">
            © 2026. All systems nominal.
          </p>
        </div>
      </footer>
    </div>
  );
}
