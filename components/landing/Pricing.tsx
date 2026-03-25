import { Check } from "lucide-react";

export function Pricing() {
  const tiers = [
    {
      name: "Free Draft",
      price: "$0",
      period: "forever",
      desc: "For local ideation and testing the waters.",
      features: ["5 Active Projects", "Unlimited Captures", "Basic AI Tagging", "Community Discord"],
      cta: "Launch Draft",
      highlight: false,
    },
    {
      name: "Momentum",
      price: "$12",
      period: "per month",
      desc: "For indie developers who need to ship today.",
      features: ["Unlimited Projects", "Deep Semantic AI Incubation", "Daily Executive Briefs", "Cursor Scheduler Integration", "Priority Support"],
      cta: "Start 7-Day Trial",
      highlight: true,
    }
  ];

  return (
    <section id="pricing" className="w-full py-24 md:py-32 px-6 md:px-24">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="text-center mb-16 flex flex-col gap-4">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#ededed]">
            Simple, transparent pricing.
          </h2>
          <p className="text-neutral-500 text-lg font-light">
            Invest in a system that forces your ideas into reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                tier.highlight 
                  ? "bg-white/[0.03] border border-purple-500/30 shadow-[0_0_40px_rgba(139,92,246,0.1)] -translate-y-2 py-10" 
                  : "bg-white/[0.01] border border-white/5 hover:border-white/10"
              }`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8b5cf6] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-semibold tracking-tight text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-neutral-500 mb-6 font-light">{tier.desc}</p>
              
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tighter text-white">{tier.price}</span>
                <span className="text-sm text-neutral-500">{tier.period}</span>
              </div>

              <ul className="flex flex-col gap-4 mb-10 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-0.5 ${tier.highlight ? 'bg-purple-500/20' : 'bg-white/5'}`}>
                      <Check size={14} className={tier.highlight ? 'text-purple-400' : 'text-neutral-400'} />
                    </div>
                    <span className="text-sm text-neutral-300 font-light">{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  tier.highlight
                    ? "bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.03] text-white hover:bg-white/10 border border-white/10 hover:scale-[1.02]"
                }`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
