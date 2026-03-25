"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Workflow() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pipeline-line",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top center",
            end: "bottom center",
            scrub: true,
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: "01",
      title: "One-Click Extract",
      desc: "Snag any web page, video, or screenshot without interrupting your flow.",
    },
    {
      num: "02",
      title: "AI Synthesis",
      desc: "The engine links your scattered evidence into concrete project blueprints.",
    },
    {
      num: "03",
      title: "Forced Execution",
      desc: "Our bot validates your architecture and pushes you daily to launch.",
    }
  ];

  return (
    <section ref={containerRef} className="w-full py-24 px-6 md:px-24 border-t border-white/[0.02]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-8 justify-between">
        
        <div className="md:w-1/3 flex flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-[#ededed]">
            The Momentum Loop
          </h2>
          <p className="text-neutral-500 font-light text-lg">
            A linear system built to eliminate procrastination and force execution.
          </p>
        </div>

        <div className="md:w-3/5 relative grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          
          {/* Animated SVG Pipeline Line */}
          <div className="absolute top-[34px] left-0 w-full h-[1px] hidden sm:block pointer-events-none z-0">
            <div className="w-full h-full bg-white/[0.03]" />
            <div className="absolute top-0 left-0 h-full w-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] pipeline-line origin-left" />
          </div>

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-4 relative z-10">
              <span className="text-sm font-mono text-neutral-600 pb-4 border-b border-white/5">{step.num}</span>
              <h3 className="text-lg font-medium text-white tracking-tight">{step.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-light">{step.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
