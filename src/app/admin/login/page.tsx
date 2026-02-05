"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert("Erro: " + error.message);
            setLoading(false);
            return;
        }

        // Sucesso: Pequeno delay e refresh total
        setTimeout(() => {
            window.location.href = "/admin";
        }, 500);
    };

    return (
        <main className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
                <div className="text-center mb-8 text-white">
                    <Lock className="text-cyan-400 mx-auto mb-4" size={40} />
                    <h1 className="text-2xl font-bold">Tripulação Admin</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email" placeholder="E-mail" required value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
                    />
                    <input
                        type="password" placeholder="Senha" required value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
                    />
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
                        {loading ? "Entrando..." : "Acessar Painel"}
                    </button>
                </form>
            </div>
        </main>
    );
}