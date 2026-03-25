"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element",
        { y: 20, opacity: 0, filter: "blur(10px)" },
        { 
          y: 0, 
          opacity: 1, 
          filter: "blur(0px)", 
          duration: 1.2, 
          stagger: 0.15, 
          ease: "power3.out",
          delay: 0.2
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-6 md:px-24 pt-32 overflow-hidden"
    >
      {/* Subtle Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">
        
        {/* Release Status */}
        <div className="hero-element mb-12 flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-medium text-neutral-400 tracking-wide uppercase">Seedflux AI Incubator</span>
        </div>

        {/* Headlines */}
        <div className="flex flex-col items-center gap-2 lg:gap-4 mb-8">
          <h1 className="hero-element text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-400 tracking-tight">
            Stop organizing.
          </h1>
          <h2 className="hero-element text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-neutral-500 pt-2 pb-4">
            Start executing.
          </h2>
        </div>

        {/* Subheading */}
        <p className="hero-element text-lg md:text-xl text-neutral-400 max-w-2xl font-normal leading-relaxed mb-12">
          Your second brain and relentless intelligent incubator. We bridge the gap between having a million ideas and actually shipping them.
        </p>

        {/* CTA */}
        <div className="hero-element flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button className="h-12 px-8 rounded-full bg-white text-black font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Install Extension
          </button>
        </div>

      </div>
    </section>
  );
}
