export function Solution() {
  return (
    <section className="w-full py-16 md:py-24 flex flex-col items-center justify-center px-6 md:px-24 relative overflow-hidden">
      
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 mx-auto shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#ededed]">
          Your relentless artificial co-founder.
        </h2>
        
        <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
          We replaced passive storage with an active pipeline. One-click capture evidence. AI synthesizes your blueprint. An aggressive bot pushes you to execute via daily micro-tasks. 
        </p>
      </div>
    </section>
  );
}
