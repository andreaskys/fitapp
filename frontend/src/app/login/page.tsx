"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { LogIn, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    // 1. Start with completely blank credentials for real users
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // 2. Send the real credentials to your Spring Boot Backend
            const res = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                document.cookie = `auth-token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
                router.push("/clinics");
            } else {
                setError("Invalid email or password. Please try again.");
            }
        } catch (err) {
            setError("Cannot connect to the security server. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fbfbfd]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[440px] bg-white/80 backdrop-blur-2xl p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Login</h1>
                    <p className="text-zinc-500 text-sm mt-2 font-medium">Entre com suas credenciais</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-100/50 rounded-2xl border border-transparent focus:border-blue-500/20 focus:bg-white outline-none transition-all duration-300 placeholder:text-zinc-300 text-black"
                            placeholder="name@clinic.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-100/50 rounded-2xl border border-transparent focus:border-blue-500/20 focus:bg-white outline-none transition-all duration-300 placeholder:text-zinc-300 text-black"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-xs font-bold justify-center bg-red-50 p-3 rounded-xl">
                            <AlertCircle size={14} /> {error}
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm shadow-lg shadow-black/10 hover:shadow-black/20 transition-all flex items-center justify-center gap-2 group mt-8 disabled:opacity-50"
                    >
                        {isLoading ? <><Loader2 size={18} className="animate-spin"/> Authenticating...</> : "Continue"}
                        {!isLoading && <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </motion.button>
                </form>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-xs text-zinc-400 font-medium"
            >
                Secure Access Enabled
            </motion.p>
        </main>
    );
}