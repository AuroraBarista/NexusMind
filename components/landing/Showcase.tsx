"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, Video, FileText, Image as ImageIcon, Send, Sparkles } from "lucide-react";

export function Showcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const captureIconsRef = useRef<HTMLDivElement>(null);
  const aiToastRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // 1. One-Click Capture Animation
      gsap.fromTo(
        ".capture-icon",
        { y: -30, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: captureIconsRef.current,
            start: "top 80%",
          }
        }
      );

      // 2. AI Discovery Toast Animation
      gsap.fromTo(
        aiToastRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: aiToastRef.current,
            start: "top 90%",
          }
        }
      );

      // 3. Chat Bot Typing Animation
      gsap.fromTo(
        ".chat-bubble",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: chatMessagesRef.current,
            start: "top 80%",
          }
        }
      );

      // 4. 3D Tilt effect
      const cards = gsap.utils.toArray<HTMLElement>('.glass-card-tilt');
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Rotate relative to distance to center (max 4 degrees)
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;
          
          gsap.to(card, {
            rotateX,
            rotateY,
            duration: 0.5,
            ease: 'power3.out',
            transformPerspective: 1000,
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 1,
            ease: 'power3.out'
          });
        });
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-12 md:py-24 px-6 md:px-24">
      <div className="max-w-6xl mx-auto flex flex-col gap-24">
        
        {/* Core Philosophy Header */}
        <div className="text-center flex flex-col gap-4 mb-8">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#ededed]">
            The intelligent pipeline to execution.
          </h2>
          <p className="text-neutral-500 text-lg font-light max-w-2xl mx-auto">
            From fragmented evidence to a fully launched product.
          </p>
        </div>

        {/* Feature 1: One-Click Capture */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="inline-flex w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 items-center justify-center text-purple-400">
              <Sparkles size={20} />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-white">One-click global capture.</h3>
            <p className="text-neutral-400 text-lg font-light leading-relaxed">
              Don't break your flow. Our universal extension instantly grabs websites, videos, screenshots, and files. It dumps them directly into your second brain folder without friction.
            </p>
          </div>
          <div className="lg:w-1/2 w-full aspect-[4/3] rounded-2xl glass-card flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] glass-card-tilt">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[50%] bg-purple-500/10 blur-[100px] pointer-events-none" />
            
            {/* Simulated UI: Extension Overlay */}
            <div className="w-[80%] max-w-[320px] bg-[#050505] rounded-xl border border-white/10 shadow-2xl overflow-hidden z-10">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0a0a0a]">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-purple-500 rounded-full" />
                </div>
              </div>
              <div ref={captureIconsRef} className="p-6 grid grid-cols-2 gap-4">
                <div className="capture-icon h-20 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-crosshair">
                  <Link size={20} />
                  <span className="text-xs font-medium">Link</span>
                </div>
                <div className="capture-icon h-20 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-crosshair">
                  <Video size={20} />
                  <span className="text-xs font-medium">Video</span>
                </div>
                <div className="capture-icon h-20 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-crosshair">
                  <ImageIcon size={20} />
                  <span className="text-xs font-medium">Capture</span>
                </div>
                <div className="capture-icon h-20 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-crosshair">
                  <FileText size={20} />
                  <span className="text-xs font-medium">File</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: AI Discovery */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-24">
          <div className="lg:w-1/2 flex flex-col gap-6">
             <div className="inline-flex w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 items-center justify-center text-blue-400">
              <img src="data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/%3E%3Cpolyline points='3.27 6.96 12 12.01 20.73 6.96'/%3E%3Cline x1='12' y1='22.08' x2='12' y2='12'/%3E%3C/svg%3E" className="w-5 h-5" alt="Icon" />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-white">AI Project Discovery.</h3>
            <p className="text-neutral-400 text-lg font-light leading-relaxed">
              You don't need to manually connect dots. Our intelligence engine analyzes your scattered evidence—identifying patterns and spontaneously suggesting viable new projects to pursue.
            </p>
          </div>
          <div className="lg:w-1/2 w-full aspect-[4/3] rounded-2xl glass-card flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] glass-card-tilt">
            {/* Network Nodes Mockup */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 400 300">
                <circle cx="100" cy="100" r="4" fill="#8b5cf6" />
                <circle cx="300" cy="80" r="4" fill="#8b5cf6" />
                <circle cx="200" cy="200" r="4" fill="#8b5cf6" />
                <line x1="100" y1="100" x2="200" y2="200" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="300" y1="80" x2="200" y2="200" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
            </div>
            
            {/* Simulated UI: AI Toast */}
            <div ref={aiToastRef} className="relative z-10 w-[85%] bg-white/[0.02] border border-blue-500/20 backdrop-blur-xl rounded-2xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(59,130,246,0.2)]">
               <div className="flex items-start gap-4">
                 <div className="mt-1 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                   <Sparkles size={14} className="text-blue-400" />
                 </div>
                 <div className="flex flex-col gap-2">
                   <h4 className="text-white font-medium">Potential Project Discovered</h4>
                   <p className="text-sm text-neutral-400 leading-relaxed">
                     Based on 12 recently saved AI whitepapers and trading toolings, I've outlined an architecture for an <strong className="text-white font-medium">Auto-Trading Bot Pipeline</strong>.
                   </p>
                   <button className="mt-2 self-start text-xs font-semibold px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                     Import Evidences & Initialize
                   </button>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Guided Execution */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          <div className="lg:w-1/2 flex flex-col gap-6">
             <div className="inline-flex w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 items-center justify-center text-emerald-400">
              <Send size={20} />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-white">The Execution Push Bot.</h3>
            <p className="text-neutral-400 text-lg font-light leading-relaxed">
              Once an idea is initialized, Seedflux becomes your strict product manager. The bot breaks down requirements, validates logic step-by-step, and persistently pushes you until the project hits production.
            </p>
          </div>
          <div className="lg:w-1/2 w-full aspect-[4/3] rounded-2xl glass-card flex items-end justify-center relative overflow-hidden bg-[#0a0a0a] p-6 glass-card-tilt">
            
            {/* Simulated UI: Chat Interface */}
            <div ref={chatMessagesRef} className="w-full max-w-[400px] flex flex-col gap-4">
              
              <div className="chat-bubble self-start max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/5 text-sm text-neutral-300">
                <span className="text-emerald-400 text-xs font-semibold mb-1 block">Seedflux PM</span>
                I noticed a conflict in your proposed database architecture. Are you planning to resolve this using Supabase?
              </div>
              
              <div className="chat-bubble self-end max-w-[85%] p-4 rounded-2xl rounded-tr-sm bg-purple-500 text-white text-sm shadow-[0_10px_20px_rgba(139,92,246,0.3)]">
                Yes, exactly. Can you generate the schema for me?
              </div>

              <div className="chat-bubble self-start max-w-[85%] p-4 rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/5 text-sm text-neutral-300">
                <span className="text-emerald-400 text-xs font-semibold mb-1 block">Seedflux PM</span>
                Schema locked. <strong>Can you complete the API integration by this Friday?</strong> I will schedule a forced check-in to ensure momentum.
              </div>

            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
