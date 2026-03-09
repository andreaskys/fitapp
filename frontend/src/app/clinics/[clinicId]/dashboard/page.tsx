"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, UserCircle2, ChevronRight, Loader2, Trash2, Users, CalendarCheck, Settings, LogOut, User, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/proxy";

interface DashboardPatient {
    id: number;
    name: string;
    referralSource: string | null;
    instagramUser: string | null;
}

interface DashboardMetrics {
    totalPatients: number;
    appointmentsToday: number;
}

export default function ClinicDashboard({ params }: { params: Promise<{ clinicId: string }> }) {
    const { clinicId } = use(params);
    const [patients, setPatients] = useState<DashboardPatient[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({ totalPatients: 0, appointmentsToday: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [clinicName, setClinicName] = useState("Carregando clinica...");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // NOVO: Estado para armazenar o que o usuário digitou na pesquisa
    const [searchTerm, setSearchTerm] = useState("");

    const router = useRouter();

    const handleLogout = () => {
        document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.push("/login");
    };

    // Função inteligente para evitar o erro de JSON.parse que vimos antes
    const fetchJsonSafe = async (url: string) => {
        try {
            const res = await apiFetch(url);
            if (!res.ok) {
                console.warn(`Aviso: Endpoint ${url} retornou status ${res.status}`);
                return null;
            }
            const text = await res.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.error(`Falha na requisição para ${url}:`, error);
            return null;
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);

            const [patientsData, metricsData, clinicData] = await Promise.all([
                fetchJsonSafe(`/api/patients?clinicId=${clinicId}`),
                fetchJsonSafe(`/api/clinics/${clinicId}/metrics`),
                fetchJsonSafe(`/api/clinics/${clinicId}`)
            ]);

            setPatients(patientsData || []);
            setMetrics(metricsData || { totalPatients: 0, appointmentsToday: 0 });
            setClinicName(clinicData?.name || "Minha Clínica");

            setIsLoading(false);
        };

        loadDashboardData();
    }, [clinicId]);

    const handleDeletePatient = async (e: React.MouseEvent, id: number, name: string) => {
        e.preventDefault();
        if (!window.confirm(`Deletar permanentemente ${name} e todo o seu histórico clínico?`)) return;
        try {
            const res = await apiFetch(`/api/patients/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPatients(patients.filter(p => p.id !== id));
                setMetrics(prev => ({ ...prev, totalPatients: prev.totalPatients - 1 }));
            }
        } catch (err) {
            console.error("Erro ao deletar paciente:", err);
        }
    };

    // NOVO: Filtra a lista de pacientes baseada no que está digitado na barra
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen bg-[#fbfbfd]">

            {/* Top Navigation & User Dropdown */}
            <div className="flex justify-end w-full mb-8 relative z-50">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 p-2 pr-5 bg-white rounded-full border border-zinc-200 shadow-sm hover:shadow-md transition-all focus:outline-none"
                >
                    <div className="w-8 h-8 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
                        <User size={16} className="text-zinc-500"/>
                    </div>
                    <span className="text-sm font-bold text-[#1d1d1f]">Minha conta</span>
                </button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{opacity: 0, y: 10, scale: 0.95}} animate={{opacity: 1, y: 0, scale: 1}} exit={{opacity: 0, y: 10, scale: 0.95}} transition={{duration: 0.15, ease: "easeOut"}}
                            className="absolute top-14 right-0 w-64 bg-white/80 backdrop-blur-2xl border border-zinc-100 shadow-[0_30px_60px_rgba(0,0,0,0.1)] rounded-2xl p-2"
                        >
                            <div className="px-4 py-4 border-b border-zinc-50 mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">minha sessão</p>
                                <p className="text-sm font-bold text-black truncate">Nutricionista</p>
                            </div>
                            <Link href="/settings" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-400 hover:text-black hover:bg-zinc-50 rounded-xl transition-colors">
                                <Settings size={16}/> Configurações
                            </Link>
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1">
                                <LogOut size={16}/> Deslogar
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Header */}
            <motion.header
                initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-2">{clinicName}</h1>
                </div>

                <Link href={`/clinics/${clinicId}/patients/new`}>
                    <motion.button
                        whileHover={{scale: 1.02}} whileTap={{scale: 0.98}}
                        className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-black/10 transition-all group"
                    >
                        Novo Paciente <UserPlus size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </motion.button>
                </Link>
            </motion.header>

            {/* Dashboard Metrics Grid */}
            <motion.div
                initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
            >
                <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-[0_20px_40px_rgba(0,0,0,0.02)] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Pacientes Ativos </p>
                        <h2 className="text-5xl font-black text-black tracking-tighter">
                            {isLoading ? <Loader2 className="animate-spin text-zinc-300"/> : metrics.totalPatients.toString().padStart(2, '0')}
                        </h2>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Users size={28} className="text-blue-500"/>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-zinc-100 shadow-[0_20px_40px_rgba(0,0,0,0.02)] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Consultas hoje</p>
                        <h2 className="text-5xl font-black text-black tracking-tighter">
                            {isLoading ? <Loader2 className="animate-spin text-zinc-300"/> : metrics.appointmentsToday.toString().padStart(2, '0')}
                        </h2>
                    </div>
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                        <CalendarCheck size={28} className="text-orange-500"/>
                    </div>
                </div>
            </motion.div>

            {/* Roster Container */}
            <motion.div
                initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}
                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-zinc-100 min-h-[400px]"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-4 border-b border-zinc-100 gap-4">
                    <div className="flex items-center gap-2">
                        <UserCircle2 size={24} className="text-zinc-300"/>
                        <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-400">
                            Ficha de Pacientes
                        </h2>
                        {isLoading && <Loader2 size={16} className="text-zinc-300 animate-spin ml-2"/>}
                    </div>

                    {/* NOVO: Barra de Pesquisa */}
                    <div className="relative w-full md:w-72">
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-black placeholder:text-zinc-400 transition-all"
                        />
                        <Search size={16} className="absolute left-4 top-3.5 text-zinc-400" />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {!isLoading && patients.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <p className="font-medium">Nenhum paciente cadastrado nesta clinica ainda.</p>
                            <p className="text-sm mt-1">Clique em "Novo Paciente" para começar a primeira ficha.</p>
                        </div>
                    )}

                    {/* NOVO: Mensagem caso a pesquisa não encontre ninguém */}
                    {!isLoading && patients.length > 0 && filteredPatients.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <p className="font-medium">Nenhum paciente encontrado com "{searchTerm}".</p>
                        </div>
                    )}

                    {/* NOVO: Mapeia o array filtrado, e não o array original */}
                    {filteredPatients.map((patient) => (
                        <div key={patient.id} className="relative block group">
                            <Link href={`/clinics/${clinicId}/patients/${patient.id}`} className="block">
                                <motion.div whileHover={{x: 5}} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 rounded-2xl hover:bg-zinc-50/80 transition-all duration-300 border border-transparent hover:border-zinc-100 cursor-pointer pr-16">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold tracking-tight text-black group-hover:text-blue-600 transition-colors">
                                            {patient.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 uppercase tracking-widest mt-1">
                                            Origem: {patient.referralSource || "Interno"}
                                            {patient.instagramUser && <span className="text-blue-500">{patient.instagramUser}</span>}
                                        </div>
                                    </div>
                                    <div className="mt-4 sm:mt-0 flex justify-end gap-3 items-center">
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Ficha Ativa</span>
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <ChevronRight size={18}/>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>

                            <button
                                onClick={(e) => handleDeletePatient(e, patient.id, patient.name)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-black hover:text-red-500 hover:bg-red-50 rounded-xl transition-all z-10"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}