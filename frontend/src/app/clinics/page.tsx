"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Plus, Building2, ChevronRight, Loader2, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/proxy";

interface Clinic {
    id: number;
    name: string;
}

export default function ClinicsPage() {
    const router = useRouter();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Creation State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClinicName, setNewClinicName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const res = await apiFetch("/api/clinics");
            if (res.ok) {
                const data = await res.json();
                setClinics(data);
            }
        } catch (err) {
            console.error("Failed to load workspaces");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClinic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClinicName.trim()) return;
        setIsCreating(true);

        try {
            const res = await apiFetch("/api/clinics", {
                method: "POST",
                body: JSON.stringify({ name: newClinicName })
            });
            if (res.ok) {
                const newClinic = await res.json();
                // Add the new clinic to the grid
                setClinics([...clinics, newClinic]);
                // Close the modal and reset the input
                setIsModalOpen(false);
                setNewClinicName("");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClinic = async (e: React.MouseEvent, id: number, name: string) => {
        e.preventDefault();
        if (!window.confirm(`Delete "${name}" and ALL its patients? This is permanent.`)) return;

        try {
            const res = await apiFetch(`/api/clinics/${id}`, { method: "DELETE" });
            if (res.ok) {
                setClinics(clinics.filter(c => c.id !== id));
            }
        } catch (err) {
            console.error("Network error while trying to delete clinic.");
        }
    };

    const handleLogout = () => {
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.push("/login");
    };

    return (
        <main className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans">

            {/* Top Navigation */}
            <header className="flex justify-between items-center p-8 max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Building2 size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-xl italic tracking-tight">Dieta Facil Goiânia</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-black transition-colors"
                >
                    Sair <LogOut size={16} />
                </button>
            </header>

            <div className="max-w-6xl mx-auto px-8 pt-12 pb-24">

                {/* Hero Section & Action Button */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-bold tracking-tight mb-2">
                            Bem vindo!
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-zinc-400 font-medium">
                            Selecione o consultorio ou crie um novo se precisar.
                        </motion.p>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                        onClick={() => setIsModalOpen(true)}
                        className="bg-black text-white px-8 py-4 rounded-[1.5rem] font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shrink-0"
                    >
                        <Plus size={18} /> Novo Consultorio
                    </motion.button>
                </div>

                {/* Clinics Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" size={32} /></div>
                ) : clinics.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-zinc-100 border-dashed">
                        <Building2 size={48} className="text-zinc-200 mb-4" />
                        <h3 className="text-xl font-bold text-black mb-1">Nenhum consultorio encontrado</h3>
                        <p className="text-zinc-400 text-sm">Clique no botao e crie o seu primeiro consultorio.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {clinics.map((clinic) => (
                            <div key={clinic.id} className="relative group block">
                                <Link href={`/clinics/${clinic.id}/dashboard`} className="block">
                                    <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:border-zinc-200 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col h-full cursor-pointer pr-16">
                                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                                            <Building2 size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">{clinic.name}</h2>
                                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-auto">ID: #{clinic.id}</p>

                                        {/* Hover Arrow */}
                                        <div className="absolute right-8 bottom-8 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                </Link>

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDeleteClinic(e, clinic.id, clinic.name)}
                                    className="absolute top-6 right-6 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-10 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Creation Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md relative z-10 shadow-2xl shadow-black/10"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:bg-zinc-50 rounded-full transition-colors">
                                <X size={20} />
                            </button>

                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                                <Building2 size={24} className="text-blue-500" />
                            </div>

                            <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Novo Consultorio</h2>
                            <p className="text-sm text-zinc-500 mb-8">Establish a new isolated environment for your clinic and patients.</p>

                            <form onSubmit={handleCreateClinic} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Clinic Name</label>
                                    <input
                                        type="text" autoFocus required
                                        value={newClinicName} onChange={(e) => setNewClinicName(e.target.value)}
                                        className="w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-transparent focus:border-blue-500/20 focus:bg-white outline-none transition-all duration-300 font-medium text-black placeholder:text-zinc-300"
                                        placeholder="e.g. Downtown Dietetics"
                                    />
                                </div>

                                <button
                                    type="submit" disabled={isCreating}
                                    className="w-full bg-black text-white px-8 py-4 rounded-[1.5rem] font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    {isCreating ? <Loader2 size={18} className="animate-spin" /> : "Create Workspace"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}