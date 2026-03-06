"use client";

import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Save, Ruler, Activity, Utensils, Weight, CheckCircle, History, Trash2, TrendingDown, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {apiFetch} from "@/lib/proxy";

interface AppointmentData {
    id: number;
    appointmentDate: string;
    weight: number;
    hipMeasure: number;
    waistMeasure: number;
    dietNumber: number | null;
}

interface Patient {
    id: number;
    name: string;
    instagramUser: string | null;
    appointments: AppointmentData[];
}

export default function PatientProfilePage({ params }: { params: Promise<{ clinicId: string; patientId: string }> }) {
    const { clinicId, patientId } = use(params);
    const router = useRouter();

    const [patient, setPatient] = useState<Patient | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validationError, setValidationError] = useState("");

    const [appointmentData, setAppointmentData] = useState({
        appointmentDate: new Date().toISOString().split('T')[0],
        weight: "",
        hipMeasure: "",
        waistMeasure: "",
        dietNumber: "",
        observations: ""
    });

    const fetchPatientData = () => {
        apiFetch(`/api/patients/${patientId}`)
            .then(res => res.json())
            .then(data => setPatient(data))
            .catch(err => console.error("Error fetching patient:", err));
    };

    useEffect(() => {
        fetchPatientData();
    }, [patientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAppointmentData({ ...appointmentData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccess(false);
        setValidationError("");

        const weightNum = parseFloat(appointmentData.weight);
        const hipNum = parseFloat(appointmentData.hipMeasure);
        const waistNum = parseFloat(appointmentData.waistMeasure);

        if (!appointmentData.appointmentDate) {
            setValidationError("Please select a valid appointment date.");
            setIsSubmitting(false);
            return;
        }
        if (weightNum <= 0 || hipNum <= 0 || waistNum <= 0) {
            setValidationError("Clinical measurements must be greater than zero.");
            setIsSubmitting(false);
            return;
        }
        if (appointmentData.dietNumber && parseInt(appointmentData.dietNumber, 10) < 0) {
            setValidationError("Diet number cannot be negative.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            appointmentDate: appointmentData.appointmentDate,
            weight: appointmentData.weight ? parseFloat(appointmentData.weight) : null,
            hipMeasure: appointmentData.hipMeasure ? parseFloat(appointmentData.hipMeasure) : null,
            waistMeasure: appointmentData.waistMeasure ? parseFloat(appointmentData.waistMeasure) : null,
            dietNumber: appointmentData.dietNumber ? parseInt(appointmentData.dietNumber, 10) : null,
            observations: appointmentData.observations
        };

        try {
            const res = await apiFetch(`/api/patients/${patientId}/appointments`, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setSuccess(true);
                setAppointmentData(prev => ({ ...prev, weight: "", hipMeasure: "", waistMeasure: "", dietNumber: "", observations: "" }));
                fetchPatientData();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                setValidationError("Failed to save session. Please try again.");
            }
        } catch (err) {
            setValidationError("Cannot connect to the secure server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePatient = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this patient and all their clinical history?")) return;
        try {
            const res = await apiFetch(`/api/patients/${patientId}`, { method: "DELETE" });
            if (res.ok) router.push(`/clinics/${clinicId}/dashboard`);
        } catch (err) {
            console.error("Failed to delete patient");
        }
    };

    const labelStyle = "text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1";
    const inputStyle = "w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-transparent focus:border-blue-500/20 focus:bg-white outline-none transition-all duration-300 placeholder:text-zinc-300 text-black";

    if (!patient) return <div className="p-20 font-bold uppercase tracking-tighter text-zinc-400 animate-pulse">Accessing Patient File...</div>;

    const sortedAppointments = patient.appointments?.sort((a, b) =>
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    ) || [];

    const chartData = [...sortedAppointments].reverse().map(app => ({
        date: new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: app.weight
    }));

    return (
        <main className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen bg-[#fbfbfd]">

            {/* Dynamic Profile Header */}
            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm relative">
                <Link href={`/clinics/${clinicId}/dashboard`} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors font-medium text-sm group">
                    <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={18} /></div> Dashboard
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-black">{patient.name} <span className="text-zinc-300 font-normal ml-2">ID: #{patientId}</span></h1>

                <div className="flex items-center gap-4">
                    <button onClick={handleDeletePatient} className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors font-medium text-sm group">
                        Delete File <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors"><Trash2 size={18} /></div>
                    </button>
                    <div className="w-px h-4 bg-zinc-200"></div>
                    <button className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors font-medium text-sm group">
                        Sign Out <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors"><LogOut size={18} /></div>
                    </button>
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

                {/* LEFT: New Entry Form */}
                <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.02)] border border-white">
                        <div className="flex items-center justify-between border-b-2 border-blue-50 pb-3 mb-10">
                            <div className="flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" />
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Appointment Session // New Entry</h2>
                            </div>
                            {success && <span className="text-emerald-500 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle size={14}/> Saved</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                            <div className="space-y-2">
                                <label className={labelStyle}>Date</label>
                                <input type="date" name="appointmentDate" value={appointmentData.appointmentDate} onChange={handleChange} required className={inputStyle} />
                            </div>

                            <div className="space-y-2">
                                <label className={`${labelStyle} flex items-center gap-1.5`}><Utensils size={14}/> Prescribed Diet Number</label>
                                <input type="number" name="dietNumber" value={appointmentData.dietNumber} onChange={handleChange} className={inputStyle} placeholder="e.g. 4" />
                            </div>

                            <div className="space-y-2">
                                <label className={`${labelStyle} flex items-center gap-1.5`}><Weight size={14}/> Weight (kg)</label>
                                <input type="number" step="0.1" name="weight" value={appointmentData.weight} onChange={handleChange} required className={`${inputStyle} font-bold text-lg`} placeholder="0.0" />
                            </div>

                            <div className="space-y-2">
                                <label className={`${labelStyle} flex items-center gap-1.5`}><Ruler size={14}/> Hip Measure (cm)</label>
                                <input type="number" step="0.1" name="hipMeasure" value={appointmentData.hipMeasure} onChange={handleChange} required className={`${inputStyle} font-bold text-lg`} placeholder="0.0" />
                            </div>

                            <div className="space-y-2">
                                <label className={`${labelStyle} flex items-center gap-1.5`}><Ruler size={14}/> Waist Measure (cm)</label>
                                <input type="number" step="0.1" name="waistMeasure" value={appointmentData.waistMeasure} onChange={handleChange} required className={`${inputStyle} font-bold text-lg`} placeholder="0.0" />
                            </div>
                        </div>

                        <div className="space-y-2 mb-10">
                            <label className={labelStyle}>Session Observation</label>
                            <textarea name="observations" value={appointmentData.observations} onChange={handleChange} className={inputStyle} rows={3} placeholder="Clinical notes, diet changes, or feedback..."></textarea>
                        </div>

                        {/* NEW: Validation Error Display */}
                        {validationError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-4 rounded-2xl mb-6 border border-red-100"
                            >
                                <AlertCircle size={16} /> {validationError}
                            </motion.div>
                        )}

                        <div className="flex justify-end">
                            <motion.button
                                type="submit" disabled={isSubmitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className={`px-10 py-5 text-white rounded-[1.5rem] font-bold text-sm shadow-xl transition-all flex items-center gap-3 disabled:opacity-50
                            ${success ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-black shadow-black/10 hover:shadow-black/20'}`}
                            >
                                {success ? <><CheckCircle size={18} /> Session Logged</> : <><Save size={18} /> {isSubmitting ? "Saving..." : "Save Session Data"}</>}
                            </motion.button>
                        </div>
                    </form>
                </motion.section>

                {/* RIGHT: Dynamic Clinical History & Chart */}
                <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)] flex flex-col h-[calc(100vh-8rem)] sticky top-8"
                >
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-50 shrink-0">
                        <div className="flex items-center gap-2">
                            <History size={18} className="text-zinc-300"/>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Clinical History</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
                            <TrendingDown size={14} /> Progress
                        </div>
                    </div>

                    {/* Weight Progress Line Chart */}
                    {chartData.length > 0 && (
                        <div className="h-48 w-full shrink-0 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={['dataMin - 2', 'dataMax + 2']}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#3b82f6' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#3b82f6' }}
                                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Scrollable list of past appointments */}
                    <div className="overflow-y-auto pr-4 space-y-4 flex-1 min-h-0 scroll-smooth custom-scrollbar">
                        {sortedAppointments.length > 0 ? (
                            sortedAppointments.map((app) => (
                                <div key={app.id} className="p-5 bg-zinc-50/50 rounded-[1.5rem] border border-zinc-100 hover:border-zinc-200 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="font-bold text-[#1d1d1f]">{new Date(app.appointmentDate).toLocaleDateString()}</span>
                                        {app.dietNumber !== null && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-full">
                                        Diet: #{app.dietNumber}
                                    </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-zinc-100 text-center shadow-sm">
                                        <div>
                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Weight</p>
                                            <p className="font-bold text-sm text-black">{app.weight}<span className="text-[10px] text-zinc-400 ml-0.5">kg</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Hip</p>
                                            <p className="font-bold text-sm text-black">{app.hipMeasure}<span className="text-[10px] text-zinc-400 ml-0.5">cm</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Waist</p>
                                            <p className="font-bold text-sm text-black">{app.waistMeasure}<span className="text-[10px] text-zinc-400 ml-0.5">cm</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 space-y-3 pb-10">
                                <History size={32} className="opacity-20" />
                                <div>
                                    <p className="text-sm font-medium">No previous sessions</p>
                                    <p className="text-xs mt-1">Records will appear here automatically.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.section>

            </div>
        </main>
    );
}