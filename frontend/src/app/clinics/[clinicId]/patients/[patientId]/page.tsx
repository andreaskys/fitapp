"use client";

import { use, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, User, Activity, Target,
    X, CheckCircle, Trash2, ChevronLeft, FileText,
    HeartPulse, BrainCircuit, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/proxy";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Listas atualizadas conforme a sua ficha física
const habitsConsumes = ["Leite", "Frutas e Verduras", "Carne", "Frango", "Peixe", "Ovo"];
const auriculoFields = ["Constipação", "Retenção de Líquido", "Ansiedade", "Nervosismo", "Insônia", "Dor de cabeça"];

export default function PatientPage({ params }: { params: Promise<{ clinicId: string, patientId: string }> }) {
    const { clinicId, patientId } = use(params);
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [patient, setPatient] = useState<any>(null);

    const [sessionData, setSessionData] = useState({
        appointmentDate: new Date().toISOString().split('T')[0],
        dietNumber: "",
        weight: "",
        hipMeasure: "",
        waistMeasure: "",
        sessionAuriculotherapy: "",
        observations: ""
    });

    useEffect(() => {
        const loadPatient = async () => {
            try {
                const res = await apiFetch(`/api/patients/${patientId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPatient(data);
                    if (data.appointments && data.appointments.length > 0) {
                        const sortedApts = [...data.appointments].sort((a: any, b: any) =>
                            new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
                        );
                        const lastObservation = sortedApts[0].observations || "";
                        setSessionData(prev => ({
                            ...prev,
                            observations: lastObservation
                        }));
                    }
                } else {
                    router.push(`/clinics/${clinicId}/dashboard`);
                }
            } catch (err) {
                console.error("Erro na requisição:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadPatient();
    }, [patientId, clinicId, router]);

    const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPatient((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (field: "doesNotConsume" | "auriculotherapyPoints", item: string) => {
        setPatient((prev: any) => {
            const currentArray = prev[field] || [];
            if (currentArray.includes(item)) {
                return { ...prev, [field]: currentArray.filter((i: string) => i !== item) };
            } else {
                return { ...prev, [field]: [...currentArray, item] };
            }
        });
    };

    const handleSaveSession = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch(`/api/patients/${patientId}/appointments`, {
                method: "POST",
                body: JSON.stringify(sessionData)
            });
            if (res.ok) {
                const savedAppointment = await res.json();
                setPatient((prev: any) => ({
                    ...prev,
                    appointments: [...(prev.appointments || []), savedAppointment]
                }));
                setSessionData(prev => ({
                    ...prev,
                    dietNumber: "",
                    weight: "",
                    hipMeasure: "",
                    waistMeasure: "",
                    sessionAuriculotherapy: ""
                }));
            } else {
                alert("Erro ao salvar a consulta.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePatient = async () => {
        setIsSaving(true);
        try {
            const res = await apiFetch(`/api/patients/${patientId}`, {
                method: "PUT",
                body: JSON.stringify(patient)
            });

            if (res.ok) {
                const updatedData = await res.json();
                setPatient(updatedData);
                setIsEditModalOpen(false);
            } else {
                alert("Erro ao atualizar dados.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    // Dados do gráfico
    const chartData = patient?.appointments?.map((apt: any) => ({
        data: apt.appointmentDate ? apt.appointmentDate.substring(5) : "",
        peso: parseFloat(apt.weight) || 0
    })) || [];

    const labelStyle = "text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1";
    const inputStyle = "w-full px-5 py-4 bg-zinc-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium text-black transition-all";

    if (isLoading || !patient) {
        return <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]"><Loader2 className="animate-spin text-zinc-400" size={32} /></div>;
    }

    return (
        <div className="min-h-screen bg-[#fbfbfd] p-8 flex flex-col items-center">

            {/* HEADER */}
            <div className="w-full max-w-6xl flex items-center justify-between bg-white rounded-[2rem] p-4 px-8 mb-8 shadow-sm border border-zinc-100">
                <Link href={`/clinics/${clinicId}/dashboard`} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors text-sm font-medium">
                    <ChevronLeft size={16} /> Dashboard
                </Link>

                <div className="flex flex-col items-center">
                    <h1 className="text-xl font-bold tracking-tight text-black capitalize">{patient.name}</h1>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                        <Target size={12} className="text-orange-500" />
                        Meta: {patient.desiredWeight || "N/A"} kg
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm font-medium">
                        <User size={16} /> Ficha Completa
                    </button>
                    <div className="w-px h-4 bg-zinc-200"></div>
                    <button className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors text-sm font-medium">
                        Deletar <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* COLUNA ESQUERDA: NOVA CONSULTA */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-2 mb-10 border-b-2 border-blue-50 pb-3">
                        <Activity className="text-blue-500" size={20} />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Nova Consulta</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
                        <div className="space-y-2">
                            <label className={labelStyle}>Data de Hoje</label>
                            <div className="relative">
                                <input type="date" value={sessionData.appointmentDate} onChange={(e) => setSessionData({...sessionData, appointmentDate: e.target.value})} className={inputStyle} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className={labelStyle}>Nº Da Dieta Prescrita</label>
                            <input type="text" placeholder="Ex: 4" value={sessionData.dietNumber} onChange={(e) => setSessionData({...sessionData, dietNumber: e.target.value})} className={inputStyle} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelStyle}>Peso (kg)</label>
                            <input type="number" placeholder="0.0" value={sessionData.weight} onChange={(e) => setSessionData({...sessionData, weight: e.target.value})} className={inputStyle} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelStyle}>Cintura (cm)</label>
                            <input type="number" placeholder="0.0" value={sessionData.waistMeasure} onChange={(e) => setSessionData({...sessionData, waistMeasure: e.target.value})} className={inputStyle} />
                        </div>
                        <div className="space-y-2">
                            <label className={labelStyle}>Quadril (cm)</label>
                            <input type="number" placeholder="0.0" value={sessionData.hipMeasure} onChange={(e) => setSessionData({...sessionData, hipMeasure: e.target.value})} className={inputStyle} />
                        </div>
                    </div>

                    <div className="space-y-2 mb-8 bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-orange-600 ml-1 flex items-center gap-2">
                            <BrainCircuit size={14}/> Auriculoterapia Aplicada Hoje
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: Ansiedade, Fome..."
                            value={sessionData.sessionAuriculotherapy}
                            onChange={(e) => setSessionData({...sessionData, sessionAuriculotherapy: e.target.value})}
                            className="w-full px-5 py-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 text-sm text-black shadow-sm mt-2"
                        />
                    </div>

                    <div className="space-y-2 mb-10">
                        <label className={labelStyle}>Observação da Consulta</label>
                        <textarea
                            rows={4}
                            placeholder="Anotações clínicas..."
                            value={sessionData.observations}
                            onChange={(e) => setSessionData({...sessionData, observations: e.target.value})}
                            className={`${inputStyle} resize-none`}
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <motion.button
                            disabled={isSaving}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleSaveSession}
                            className="px-10 py-5 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl hover:shadow-black/20 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                            Salvar Consulta
                        </motion.button>
                    </div>
                </div>

                {/* COLUNA DIREITA: PROGRESSO E HISTÓRICO COM SCROLL */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100 flex flex-col lg:h-[830px]">
                    <h3 className="text-sm font-bold text-black uppercase tracking-[0.2em] mb-6 border-b-2 border-zinc-50 pb-4">
                        Progresso Clínico
                    </h3>

                    {/* 1. GRÁFICO FIXO NO TOPO */}
                    {patient.appointments && patient.appointments.length > 0 ? (
                        <div className="h-48 w-full shrink-0 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa'}} dx={-10} domain={['dataMin - 2', 'dataMax + 2']} />
                                    <Tooltip
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}}
                                        itemStyle={{color: '#f97316'}}
                                    />
                                    <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 w-full shrink-0 mb-6 flex flex-col items-center justify-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
                            <p className="text-xs font-medium text-zinc-400">Gráfico aguardando consultas</p>
                        </div>
                    )}

                    {/* 2. LISTA COM SCROLL INFINITO */}
                    <div className="flex-1 overflow-y-auto pr-3 space-y-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {patient.appointments && patient.appointments.length > 0 ? (
                            // Inverte a lista para a mais nova ficar em cima
                            [...patient.appointments].reverse().map((apt: any, index: number) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    key={apt.id || Math.random()}
                                    className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100/80 hover:bg-zinc-50/50 transition-colors"
                                >
                                    {/* Cabeçalho do Card: Data e Dieta */}
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-sm font-bold text-zinc-400">{apt.appointmentDate}</p>
                                        <span className="px-3 py-1 bg-white rounded-lg text-[10px] font-black text-black shadow-sm uppercase">Dieta: {apt.dietNumber || "-"}</span>
                                    </div>

                                    {/* Dados Básicos: P, C, Q */}
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase">P:</span>
                                            <span className="text-lg text-black font-black">{apt.weight || "--"}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase">C:</span>
                                            <span className="text-base text-black font-bold">{apt.waistMeasure || "--"}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase">Q:</span>
                                            <span className="text-base text-black font-bold">{apt.hipMeasure || "--"}</span>
                                        </div>
                                    </div>
                                    {apt.sessionAuriculotherapy && (
                                        <div className="flex items-start gap-1.5 mt-2">
                                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-[3px]">Auriculoterapia:</span>
                                            <span className="text-sm text-black font-medium">{apt.sessionAuriculotherapy}</span>
                                        </div>
                                    )}
                                    {/* Observações */}
                                    {apt.observations && (
                                        <p className="text-sm text-zinc-500 pt-3 mt-3 border-t border-zinc-200/60 leading-relaxed">
                                            {apt.observations}
                                        </p>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-12">
                                <p className="text-sm font-medium">Sem consultas anteriores</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL DE FICHA COMPLETA DO PACIENTE */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-black bg-zinc-100 p-3 rounded-full transition-colors">
                                <X size={20} />
                            </button>

                            <header className="mb-12">
                                <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-2 uppercase">Ficha Do Paciente</h1>
                            </header>

                            <div className="space-y-16">
                                {/* Section 1: INFORMAÇÕES PESSOAIS */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-8">
                                        <HeartPulse size={20} className="text-orange-400" />
                                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Informações Pessoais</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-2"><label className={labelStyle}>Nome</label><input name="name" value={patient.name || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Como prefere ser chamado</label><input name="nickname" value={patient.nickname || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Data de nascimento</label><input type="date" name="birthDate" value={patient.birthDate || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Instagram</label><input name="instagramUser" value={patient.instagramUser || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Idade</label><input type="number" name="age" value={patient.age || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Celular</label><input type="tel" name="phoneNumber" value={patient.phoneNumber || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Ocupação</label><input name="occupation" value={patient.occupation || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Como nos conheceu</label><input name="referralSource" value={patient.referralSource || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                    </div>
                                </section>

                                {/* Section 2: ANAMNESE CLÍNICA */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-8">
                                        <BrainCircuit size={20} className="text-orange-400" />
                                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Anamnese Clínica</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-2"><label className={labelStyle}>Diabetes</label><input name="diabetes" value={patient.diabetes || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Hipertensão / Hipotensão</label><input name="hypertension" value={patient.hypertension || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Colesterol</label><input name="cholesterol" value={patient.cholesterol || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Triglicérides</label><input name="triglycerides" value={patient.triglycerides || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Hipotireoidismo</label><input name="hypothyroidism" value={patient.hypothyroidism || ""} onChange={handlePatientChange} className={inputStyle} /></div>
                                        <div className="space-y-2"><label className={labelStyle}>Peso Desejado</label><input name="desiredWeight" value={patient.desiredWeight || ""} onChange={handlePatientChange} className={`${inputStyle} text-orange-600 font-bold bg-orange-50/50`} /></div>
                                    </div>
                                </section>

                                {/* Section 3: HÁBITOS */}
                                <section className="space-y-12">
                                    <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-8">
                                        <Activity size={20} className="text-orange-400" />
                                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Hábitos</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <label className={labelStyle}>Não consome:</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-3">
                                            {habitsConsumes.map(item => (
                                                <div key={item} className="flex items-center gap-3 bg-zinc-50/80 p-4 rounded-xl">
                                                    <input
                                                        type="checkbox"
                                                        checked={(patient.doesNotConsume || []).includes(item)}
                                                        onChange={() => handleArrayChange("doesNotConsume", item)}
                                                        className="w-5 h-5 accent-orange-500 rounded border-zinc-200"
                                                    />
                                                    <label className="text-sm font-medium text-black">{item}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-zinc-50/80 p-8 rounded-3xl border border-zinc-100">
                                        <div className="space-y-2">
                                            <label className={labelStyle}>Realiza atividade física?</label>
                                            <div className="flex gap-12 pt-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="activity" checked={patient.performsPhysicalActivity === true} onChange={() => setPatient({...patient, performsPhysicalActivity: true})} className="w-5 h-5 accent-orange-500"/>
                                                    <span className="font-medium text-black">Sim</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="activity" checked={patient.performsPhysicalActivity === false} onChange={() => setPatient({...patient, performsPhysicalActivity: false})} className="w-5 h-5 accent-orange-500"/>
                                                    <span className="font-medium text-black">Não</span>
                                                </label>
                                            </div>
                                        </div>

                                        {patient.performsPhysicalActivity && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-2"><label className={labelStyle}>Qual?</label><input name="physicalActivityType" value={patient.physicalActivityType || ""} onChange={handlePatientChange} type="text" className="w-full px-5 py-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 text-sm text-black border border-zinc-100" /></div>
                                                <div className="space-y-2"><label className={labelStyle}>Quantas vezes por semana?</label><input name="physicalActivityFrequency" value={patient.physicalActivityFrequency || ""} onChange={handlePatientChange} type="number" className="w-full px-5 py-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/20 text-sm text-black border border-zinc-100" /></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className={labelStyle}>Observações</label>
                                        <textarea name="observations" value={patient.observations || ""} onChange={handlePatientChange} className={`${inputStyle} resize-none`} rows={4}></textarea>
                                    </div>
                                </section>

                                {/* Section 4: AURICULOTERAPIA BASE */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-8">
                                        <BrainCircuit size={20} className="text-orange-400" />
                                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Auriculoterapia Padrão</h2>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-3">
                                        {auriculoFields.map(item => (
                                            <div key={item} className="flex items-center gap-3 bg-zinc-50/80 p-4 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors" onClick={() => handleArrayChange("auriculotherapyPoints", item)}>
                                                <input
                                                    type="checkbox"
                                                    checked={(patient.auriculotherapyPoints || []).includes(item)}
                                                    readOnly
                                                    className="w-5 h-5 accent-orange-500 rounded border-zinc-200 pointer-events-none"
                                                />
                                                <label className="text-sm font-medium text-black cursor-pointer">{item}</label>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="mt-16 pt-8 border-t border-zinc-100 flex justify-end gap-4">
                                <button onClick={() => setIsEditModalOpen(false)} className="px-8 py-5 bg-white border border-zinc-200 text-zinc-600 rounded-[1.5rem] font-bold text-sm hover:bg-zinc-50 transition-colors">
                                    Cancelar
                                </button>
                                <motion.button
                                    disabled={isSaving}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleUpdatePatient}
                                    className="px-10 py-5 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl hover:shadow-black/20 transition-all flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                    Salvar Alterações
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}