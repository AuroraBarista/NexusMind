export function Cta() {
  return (
    <section className="w-full py-32 px-6 md:px-24 mb-12">
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-12 md:p-24 rounded-3xl bg-white/[0.01] border border-white/5 relative overflow-hidden">
        
        {/* Subtle Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">
            Ready to ship?
          </h2>
          <p className="text-lg md:text-xl text-neutral-500 font-light max-w-xl">
            Join the elite circle of independent developers who turned their messy brainstorms into active MRR.
          </p>
          <button className="mt-4 h-14 px-10 rounded-full bg-white text-black font-semibold text-lg tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Deploy Workspace
          </button>
        </div>
      </div>
    </section>
  );
}
