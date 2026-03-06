"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {LayoutGrid, PlusCircle, LogOut, Building2, LayoutDashboard} from "lucide-react";

export default function Sidebar({ clinicId }: { clinicId: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: "Dashboard", href: `/clinics/${clinicId}/dashboard` },
    { icon: <PlusCircle size={20}/>, label: "New Intake", href: `/clinics/${clinicId}/patients/new` },
  ];

  const handleLogout = () => {
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  };

    return (
        <aside className="w-72 h-[calc(100vh-2rem)] m-4 hidden md:flex flex-col fixed left-0 top-0 bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/5 rounded-3xl z-50 p-6">
            <div className="px-4 py-8">
                <h1 className="text-xl font-semibold tracking-tight italic">Dieta Fácil Goiânia</h1>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname.includes(item.href);
                    return (
                        <Link key={item.label} href={item.href} className="block relative">
                            <motion.div
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                  ${isActive ? 'text-black font-bold' : 'text-zinc-400 hover:text-zinc-900'}`}
                            >
                                {item.icon}
                                <span className="text-sm">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-zinc-100/80 -z-10 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto flex flex-col gap-1 border-t border-zinc-100 pt-4">
                {/* Switch Workspace Button */}
                <Link
                    href="/clinics"
                    className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-black hover:bg-zinc-50 transition-colors rounded-xl group"
                >
                    <Building2 size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-sm font-medium">Trocar de Clínica</span>
                </Link>
            </div>
        </aside>
    );
}
