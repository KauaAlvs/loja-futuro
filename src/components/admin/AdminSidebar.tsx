"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    TicketPercent
} from "lucide-react";

// Definimos o que a Sidebar espera receber
interface AdminSidebarProps {
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

export function AdminSidebar({ isCollapsed, toggleSidebar }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { name: "Visão Geral", href: "/admin", icon: LayoutDashboard, exact: true },
        { name: "Vendas", href: "/admin/sales", icon: ShoppingBag, exact: false },
        { name: "Produtos", href: "/admin/products", icon: Package, exact: false },
        { name: "Categorias", href: "/admin/categories", icon: ShoppingBag, exact: false },
        { name: "Clientes", href: "/admin/customers", icon: Users, exact: false },
        { name: "Cupons", href: "/admin/coupons", icon: TicketPercent, exact: false },
        { name: "Configurações", href: "/admin/settings", icon: Settings, exact: false },
    ];

    const handleLogout = async (e: any) => {
        e.preventDefault();
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <aside className="h-full flex flex-col justify-between bg-black">

            {/* 1. TOPO (LOGO) */}
            <div className="h-20 flex items-center justify-center border-b border-gray-800 relative overflow-hidden">
                <div className={`font-bold transition-all duration-300 whitespace-nowrap ${isCollapsed ? "opacity-0 scale-0 absolute" : "opacity-100 scale-100 text-xl"}`}>
                    FUTURE<span className="text-cyan-400">ADMIN</span>
                </div>

                <div className={`font-bold text-cyan-400 text-2xl absolute transition-all duration-300 ${isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
                    F<span className="text-white">A</span>
                </div>
            </div>

            {/* 2. MENU */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={isCollapsed ? item.name : ""}
                            className={`
                                flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden
                                ${isActive
                                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                                }
                                ${isCollapsed ? "justify-center" : ""}
                            `}
                        >
                            <Icon size={22} className={`flex-shrink-0 transition-colors ${isActive ? "text-cyan-400" : "group-hover:text-white"}`} />

                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                                {item.name}
                            </span>

                            {isActive && !isCollapsed && (
                                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* 3. RODAPÉ */}
            <div className="p-3 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mb-2
                        ${isCollapsed ? "justify-center" : ""}
                    `}
                    title="Sair"
                >
                    <LogOut size={20} />
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                        Sair
                    </span>
                </button>

                {/* BOTÃO DE RECOLHER (Chama a função do Pai) */}
                <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-400 hover:text-white py-2 rounded-lg transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
}