"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, UserCircle2, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/proxy";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [profile, setProfile] = useState({ name: "", email: "" });

    useEffect(() => {
        apiFetch("/api/users/me")
            .then(res => res.json())
            .then(data => {
                setProfile({ name: data.name, email: data.email });
                setIsLoading(false);
            })
            .catch(err => console.error("Failed to load profile", err));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await apiFetch("/api/users/me", {
                method: "PUT",
                body: JSON.stringify({ name: profile.name })
            });
            if (res.ok) {
                toast.success("Profile updated successfully!");
            }
        } catch (err) {
            console.error("Failed to update profile", err);
            toast.error("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]"><Loader2 className="animate-spin text-zinc-300" size={32} /></div>;
    }

    return (
        <main className="p-6 md:p-12 max-w-3xl mx-auto min-h-screen bg-[#fbfbfd]">

            {/* Header */}
            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm relative">
                <Link href="/clinics" className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors font-medium text-sm group">
                    <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={18} /></div> Workspaces
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-black">Account Settings</h1>
                <div className="w-24"></div> {/* Spacer for centering */}
            </motion.header>

            {/* Profile Form */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-white">

                    <div className="flex items-center gap-3 border-b-2 border-zinc-50 pb-4 mb-10">
                        <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center">
                            <UserCircle2 size={20} className="text-zinc-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Personal Profile</h2>
                            <p className="text-xs font-medium text-zinc-400 mt-0.5">Manage your identity and credentials.</p>
                        </div>
                    </div>

                    <div className="space-y-8 mb-10">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                            <input
                                type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                className="w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-transparent focus:border-blue-500/20 focus:bg-white outline-none transition-all duration-300 font-bold text-lg text-black"
                                required
                            />
                        </div>

                        {/* Email Field (Read-Only for security) */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                Account Email <ShieldCheck size={14} className="text-emerald-500" />
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email" value={profile.email} disabled
                                    className="w-full pl-12 pr-5 py-4 bg-zinc-100/50 rounded-2xl border border-transparent text-zinc-500 font-medium cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-zinc-400 ml-1 mt-1 font-medium">Contact support to change your secure login email.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-zinc-50">
                        <motion.button
                            type="submit" disabled={isSaving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                        </motion.button>
                    </div>

                </form>
            </motion.section>
        </main>
    );
}