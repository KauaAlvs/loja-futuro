"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ShieldAlert } from "lucide-react";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { AdminNav } from "../../components/admin/AdminNav"; // <--- Importando a Nav

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

    // Controle do Menu Mobile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    useEffect(() => {
        async function checkAdmin() {
            if (pathname === "/admin/login") {
                setStatus("authorized");
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            const adminEmails = ["kauak4006@gmail.com", "admin@futurestore.com"];
            const userEmail = session?.user?.email?.toLowerCase();

            if (session && adminEmails.includes(userEmail || "")) {
                setStatus("authorized");
            } else {
                setStatus("unauthorized");
            }
        }
        checkAdmin();
    }, [pathname]);

    // Fecha o menu mobile sempre que mudar de página
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (pathname === "/admin/login") return <>{children}</>;

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400">
                <Loader2 className="animate-spin mr-2" /> Verificando permissões...
            </div>
        );
    }

    if (status === "unauthorized") {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert size={60} className="text-red-500 mb-4" />
                <h1 className="text-white text-2xl font-bold mb-2">Acesso Restrito</h1>
                <button
                    onClick={() => window.location.href = "/admin/login"}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
                >
                    Fazer Login como Admin
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden">

            {/* NAV SUPERIOR (Apenas Mobile) */}
            <AdminNav isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

            {/* SIDEBAR */}
            <div
                className={`
                    fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    ${isSidebarCollapsed ? "md:w-20" : "md:w-64"}
                    w-64 bg-black border-r border-gray-800 flex-shrink-0
                `}
            >
                <AdminSidebar
                    isCollapsed={isSidebarCollapsed}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* OVERLAY (Para fechar o menu mobile ao clicar fora) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 flex flex-col min-w-0 h-full bg-gray-950">
                <main className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                    <div className="w-full max-w-[1600px] mx-auto pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}