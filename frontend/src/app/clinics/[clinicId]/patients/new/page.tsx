"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, HeartPulse, BrainCircuit, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/proxy";
// 1. IMPORT THE TOASTER
import { toast } from "sonner";

export default function NewIntakeForm({ params }: { params: Promise<{ clinicId: string }> }) {
    const { clinicId } = use(params);
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "", nickname: "", dateOfBirth: "", instagramUser: "", phone: "", occupation: "", age: "", referralSource: "",
        diabetes: "", hypertension: "", cholesterol: "", triglycerides: "", hypothyroidism: "", desiredWeight: "",
        doesNotConsume: [] as string[],
        performsPhysicalActivity: null as boolean | null,
        physicalActivityType: "", physicalActivityFrequency: "", observations: "",
        auriculotherapyPoints: [] as string[]
    });

    const habitsConsumes = ["Leite", "Frutas e Verduras", "Carne", "Frango", "Peixe", "Ovo"];
    const auriculoFields = ["Constipação", "Ansiedade", "Insônia", "Retenção de Líquido", "Nervosismo", "Dor de cabeça"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleArrayChange = (field: "doesNotConsume" | "auriculotherapyPoints", value: string) => {
        setFormData(prev => {
            const array = prev[field];
            if (array.includes(value)) return { ...prev, [field]: array.filter(item => item !== value) };
            return { ...prev, [field]: [...array, value] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            ...formData,
            age: formData.age ? parseInt(formData.age) : null,
            physicalActivityFrequency: formData.physicalActivityFrequency ? parseInt(formData.physicalActivityFrequency) : null,
            clinic: { id: parseInt(clinicId) }
        };

        try {
            const res = await apiFetch(`/api/patients?clinicId=${clinicId}`, {
                method: "POST",
                body: JSON.stringify(payload) // You no longer need the 'clinic: { id: ... }' inside the payload!
            });
            if (res.ok) {
                toast.success("Paciente cadastrado com sucesso!");
                router.push(`/clinics/${clinicId}/dashboard`);
            } else {
                toast.error("Erro ao salvar paciente. Verifique suas permissões.");
            }
        } catch (err) {
            console.error("API Connection Error:", err);
            toast.error("Erro de conexão com o servidor.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const labelStyle = "text-[11px] font-bold uppercase tracking-widest text-zinc-400 ml-1";
    const inputStyle = "w-full px-5 py-4 bg-zinc-50 rounded-2xl border border-transparent focus:border-orange-500/20 focus:bg-white outline-none transition-all duration-300 placeholder:text-zinc-300 text-black";

    return (
        <main className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen bg-[#fbfbfd]">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-16">
                <Link href={`/clinics/${clinicId}/dashboard`} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-colors font-medium text-sm group">
                    <div className="p-2 rounded-full group-hover:bg-zinc-100 transition-colors"><ArrowLeft size={18} /></div> Dashboard
                </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-sm border border-zinc-100 relative">
                <header className="mb-16">
                    <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-2 uppercase">Ficha Do Paciente</h1>
                </header>

                <form onSubmit={handleSubmit} className="space-y-16">

                    {/* Section 1: INFORMAÇÕES PESSOAIS */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-10">
                            <HeartPulse size={20} className="text-orange-400" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Informações Pessoais</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2"><label className={labelStyle}>Nome</label><input required name="name" onChange={handleChange} className={inputStyle} placeholder="Nome completo" /></div>
                            <div className="space-y-2"><label className={labelStyle}>Como prefere ser chamado (a)</label><input name="nickname" onChange={handleChange} className={inputStyle} placeholder="Apelido" /></div>
                            <div className="space-y-2"><label className={labelStyle}>Data de nascimento</label><input type="date" name="dateOfBirth" onChange={handleChange} className={inputStyle} /></div>
                            <div className="space-y-2"><label className={labelStyle}>Instagram</label><input name="instagramUser" onChange={handleChange} className={inputStyle} placeholder="@usuario" /></div>
                            <div className="space-y-2"><label className={labelStyle}>Idade</label><input type="number" name="age" onChange={handleChange} className={inputStyle} placeholder="Ex: 31" /></div>
                            <div className="space-y-2"><label className={labelStyle}>Celular</label><input type="tel" name="phone" onChange={handleChange} className={inputStyle} placeholder="(XX) XXXXX-XXXX" /></div>
                            <div className="space-y-2"><label className={labelStyle}>Ocupação</label><input name="occupation" onChange={handleChange} className={inputStyle} placeholder="Profissão" /></div>
                            <div className="space-y-2"><label className={labelStyle}>Como nos conheceu</label><input name="referralSource" onChange={handleChange} className={inputStyle} placeholder="Ex: Instagram Ads" /></div>
                        </div>
                    </section>

                    {/* Section 2: ANAMNESE CLÍNICA */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-10">
                            <BrainCircuit size={20} className="text-orange-400" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Anamnese Clínica</h2>
                        </div>
                        <div className="space-y-6">
                            {["diabetes", "hypertension", "cholesterol", "triglycerides", "hypothyroidism", "desiredWeight"].map(f => (
                                <div key={f} className="space-y-2">
                                    <label className={labelStyle}>
                                        {f === "hypertension" ? "HIPERTENSÃO / HIPOTENSÃO" :
                                            f === "desiredWeight" ? "PESO DESEJADO" :
                                                f === "hypothyroidism" ? "HIPOTIREOIDISMO" :
                                                    f === "triglycerides" ? "TRIGLICÉRIDES" :
                                                        f.toUpperCase()}
                                    </label>
                                    <input name={f} onChange={handleChange} type="text" className={inputStyle} placeholder="Status / Detalhes..." />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: HÁBITOS */}
                    <section className="space-y-12">
                        <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-10">
                            <Activity size={20} className="text-orange-400" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Hábitos</h2>
                        </div>

                        <div className="space-y-4">
                            <label className={labelStyle}>Não consome:</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-3">
                                {habitsConsumes.map(item => (
                                    <div key={item} className="flex items-center gap-3 bg-zinc-50/50 p-4 rounded-xl">
                                        <input type="checkbox" onChange={() => handleArrayChange("doesNotConsume", item)} className="w-5 h-5 accent-orange-500 rounded border-zinc-200" />
                                        <label className="text-sm font-medium text-black">{item}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 bg-zinc-50/50 p-8 rounded-3xl border border-zinc-100">
                            <div className="space-y-2">
                                <label className={labelStyle}>Realiza atividade física?</label>
                                <div className="flex gap-12 pt-3">
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="activity" onChange={() => setFormData({...formData, performsPhysicalActivity: true})} className="w-5 h-5 accent-orange-500"/>
                                        <label className="font-medium text-black">Sim</label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="radio" name="activity" onChange={() => setFormData({...formData, performsPhysicalActivity: false})} className="w-5 h-5 accent-orange-500"/>
                                        <label className="font-medium text-black">Não</label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-2"><label className={labelStyle}>Qual?</label><input name="physicalActivityType" onChange={handleChange} type="text" className={inputStyle} placeholder="Ex: Musculação" /></div>
                                <div className="space-y-2"><label className={labelStyle}>Quantas vezes por semana?</label><input name="physicalActivityFrequency" onChange={handleChange} type="number" className={inputStyle} placeholder="Ex: 3" /></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className={labelStyle}>Observações</label>
                            <textarea name="observations" onChange={handleChange} className={inputStyle} rows={4} placeholder="Notas adicionais..."></textarea>
                        </div>
                    </section>

                    {/* Section 4: AURICULOTERAPIA */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-2 border-b-2 border-orange-100 pb-3 mb-10">
                            <BrainCircuit size={20} className="text-orange-400" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#1d1d1f]">Auriculoterapia</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-3">
                            {auriculoFields.map(item => (
                                <div key={item} className="flex items-center gap-3 bg-zinc-50/50 p-4 rounded-xl">
                                    <input type="checkbox" onChange={() => handleArrayChange("auriculotherapyPoints", item)} className="w-5 h-5 accent-orange-500 rounded border-zinc-200" />
                                    <label className="text-sm font-medium text-black">{item}</label>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submit Action */}
                    <div className="pt-10 flex justify-end">
                        <motion.button
                            type="submit" disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="px-10 py-5 bg-black text-white rounded-[1.5rem] font-bold text-sm shadow-xl shadow-black/10 hover:shadow-black/20 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            <Save size={18} /> {isSubmitting ? "Salvando Paciente..." : "Finalizar Cadastro"}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}