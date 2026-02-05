"use client";

import { Menu, X, Shield, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AdminNavProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function AdminNav({ isOpen, setIsOpen }: AdminNavProps) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/admin/login";
    };

    return (
        <nav className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Shield size={20} />
                    <span>Admin</span>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title="Sair"
            >
                <LogOut size={20} />
            </button>
        </nav>
    );
}