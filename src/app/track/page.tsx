"use client";

import { useState } from "react";
import { Package, Search, ArrowRight, Truck } from "lucide-react";

export default function TrackPage() {
    const [code, setCode] = useState("");

    const handleTrack = (e: any) => {
        e.preventDefault();
        if (!code) return;

        const cleanCode = code.trim().toUpperCase();

        // Lógica Inteligente de Redirecionamento
        // Regex para Correios (2 Letras + 9 Números + 2 Letras)
        const isCorreios = /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(cleanCode);

        if (isCorreios) {
            // Link direto oficial dos Correios
            window.open(`https://rastreamento.correios.com.br/app/index.php?objeto=${cleanCode}`, '_blank');
        } else {
            // Link para o 17Track (Rastreador Universal - Pega Jadlog, Azul, Loggi, etc)
            window.open(`https://t.17track.net/pt#nums=${cleanCode}`, '_blank');
        }
    };

    return (
        <main className="min-h-screen pt-32 pb-20 px-4 bg-black text-white flex flex-col items-center">

            <div className="w-full max-w-2xl text-center mb-12">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Truck size={40} className="text-cyan-400" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Rastreie seu Pedido</h1>
                <p className="text-gray-400">
                    Digite o código de rastreamento que enviamos para o seu e-mail.
                    Nosso sistema identifica automaticamente a transportadora.
                </p>
            </div>

            <form onSubmit={handleTrack} className="w-full max-w-xl relative">
                <input
                    type="text"
                    placeholder="Ex: AA123456789BR"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-5 pl-6 pr-32 text-lg outline-none focus:border-cyan-500 transition-colors uppercase tracking-widest placeholder-gray-600"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all"
                >
                    Rastrear <ArrowRight size={20} />
                </button>
            </form>

            <div className="mt-8 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Package size={12} /> Correios</span>
                <span className="flex items-center gap-1"><Package size={12} /> Jadlog</span>
                <span className="flex items-center gap-1"><Package size={12} /> Azul Cargo</span>
                <span className="flex items-center gap-1"><Package size={12} /> Loggi</span>
            </div>

        </main>
    );
}