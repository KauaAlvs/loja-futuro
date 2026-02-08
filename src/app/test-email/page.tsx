"use client";
import { useState } from "react";

export default function TestEmailPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");

    const sendEmail = async () => {
        if (!email) {
            setStatus("❌ Por favor, digite um e-mail antes de enviar.");
            return;
        }

        setStatus("Enviando...");
        
        try {
            const res = await fetch("/api/send-welcome", {
                method: "POST",
                body: JSON.stringify({ email, name: "Admin" }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("✅ Sucesso! ID: " + data.id);
            } else {
                console.error(data);
                // Mostra o erro detalhado na tela
                const errorMsg = data.error?.message || data.error || "Erro desconhecido";
                setStatus("❌ Erro: " + JSON.stringify(errorMsg));
            }
        } catch (error) {
            setStatus("❌ Erro de conexão com o servidor.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6 p-4">
            <h1 className="text-3xl font-bold text-cyan-400">Teste de E-mail</h1>
            
            <div className="w-full max-w-md flex flex-col gap-2">
                <label className="text-sm text-gray-400">Para quem enviar? (Use seu email cadastrado no Resend)</label>
                <input 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-white focus:border-cyan-500 outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <button 
                onClick={sendEmail}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded-xl font-bold transition-all active:scale-95"
            >
                Disparar E-mail
            </button>

            <div className="bg-gray-900 p-4 rounded-xl w-full max-w-md border border-gray-800 min-h-[60px] flex items-center justify-center text-center">
                <p className="font-mono text-sm break-all">{status}</p>
            </div>
        </div>
    );
}