"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      gsap.to(glowRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out"
      });
    };
    
    // Set initial position immediately to avoid jumping from top-left
    gsap.set(glowRef.current, { x: window.innerWidth / 2, y: window.innerHeight / 2 });

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div 
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60 mix-blend-screen"
    />
  );
}
