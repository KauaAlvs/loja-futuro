"use client";
import { useState } from "react";

export default function TestEmailPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");

    const sendEmail = async () => {
        setStatus("Enviando...");
        try {
            const res = await fetch("/api/send-welcome", {
                method: "POST",
                body: JSON.stringify({ email, name: "Visitante" }),
                headers: { "Content-Type": "application/json" }
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("✅ Sucesso! ID do email: " + data.id);
            } else {
                // Aqui mostramos o erro real que veio do backend
                console.log(data);
                setStatus("❌ Erro: " + JSON.stringify(data.error));
            }
        } catch (error) {
            setStatus("❌ Erro de conexão.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-2xl font-bold">Teste de Debug de E-mail</h1>
            <input 
                type="email" 
                placeholder="Coloque SEU email de cadastro no Resend" 
                className="p-2 rounded text-black w-full max-w-md"
                onChange={(e) => setEmail(e.target.value)}
            />
            <button 
                onClick={sendEmail}
                className="bg-cyan-500 text-black px-4 py-2 rounded font-bold hover:bg-cyan-400"
            >
                Disparar Teste
            </button>
            <div className="bg-gray-900 p-4 rounded w-full max-w-md break-all">
                <p className="font-mono text-sm">{status}</p>
            </div>
        </div>
    );
}