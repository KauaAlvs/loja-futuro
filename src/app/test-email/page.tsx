"use client";
import { useState } from "react";

export default function TestEmailPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState("");

    const sendEmail = async () => {
        setStatus("Enviando...");
        const res = await fetch("/api/send-welcome", {
            method: "POST",
            body: JSON.stringify({ email, name: "Visitante" }),
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) setStatus("E-mail enviado! Verifique sua caixa de entrada.");
        else setStatus("Erro ao enviar.");
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Teste de E-mail</h1>
            <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="p-2 rounded text-black"
                onChange={(e) => setEmail(e.target.value)}
            />
            <button 
                onClick={sendEmail}
                className="bg-cyan-500 text-black px-4 py-2 rounded font-bold"
            >
                Disparar Boas-Vindas
            </button>
            <p>{status}</p>
        </div>
    );
}