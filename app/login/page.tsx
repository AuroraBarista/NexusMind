"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CircuitBoard, ArrowLeft, Chrome } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${location.origin}/auth/callback?next=/briefing`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white font-sans selection:bg-cyan-500/30 relative overflow-hidden">

            {/* Background Effects (Matching Landing Page) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full opacity-60 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

            {/* Back to Home Navigation */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute top-8 left-8 z-50"
            >
                <Link href="/" className="group flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium tracking-wide">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to NexusMind
                </Link>
            </motion.div>

            {/* Auth Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md p-10 relative z-10 glass-panel rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
                {/* Subtle Inner Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-[50px] rounded-full pointer-events-none" />

                <div className="flex flex-col items-center mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] mb-4">
                        <CircuitBoard className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-display font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Access Neural Link.
                    </h1>
                    <p className="text-xs text-neutral-400 font-mono tracking-widest mt-2 uppercase">
                        Initialize Session
                    </p>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "mb-6 p-4 rounded-xl text-xs font-mono border relative z-10",
                            message.type === 'error'
                                ? "bg-red-500/10 border-red-500/30 text-red-200"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        )}
                    >
                        {message.text}
                    </motion.div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-4 bg-white text-black hover:bg-gray-100 text-sm font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 group shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mb-4 relative z-10"
                >
                    {loading ? <Loader2 size={16} className="animate-spin text-black" /> : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    Sign In with Google
                </button>
            </motion.div>

            {/* Floating Action Button Style CTA for Extension (Optional up-sells on Login page) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-12 opacity-50 flex items-center justify-center gap-2 pointer-events-none"
            >
                <Chrome size={12} className="text-neutral-500" />
                <a href="https://drive.google.com/drive/folders/1KzgpLtHtZy-j6-vQbUt9nS9GwGVlw39N?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 hover:text-cyan-400 transition-colors pointer-events-auto">
                    Don't forget to install the extension
                </a>
            </motion.div>

        </div>
    );
}
