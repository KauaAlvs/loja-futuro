"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Settings, Power, AlertTriangle, Save, Store, ShieldAlert,
    Mail, Phone, MapPin, Instagram
} from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        id: 1,
        is_maintenance: false,
        store_name: "",
        support_email: "",
        phone: "",
        address: "",
        instagram_url: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        setLoading(true);
        const { data } = await supabase.from('store_settings').select('*').single();
        if (data) setConfig(data);
        setLoading(false);
    }

    async function toggleMaintenance() {
        const newState = !config.is_maintenance;
        if (newState === true) {
            const confirm = window.confirm("TEM CERTEZA? Isso vai tirar a loja do ar.");
            if (!confirm) return;
        }
        await saveSettings({ ...config, is_maintenance: newState });
    }

    async function saveSettings(newConfig: any) {
        setSaving(true);
        const { error } = await supabase
            .from('store_settings')
            .update({
                is_maintenance: newConfig.is_maintenance,
                store_name: newConfig.store_name,
                support_email: newConfig.support_email,
                phone: newConfig.phone,
                address: newConfig.address,
                instagram_url: newConfig.instagram_url
            })
            .eq('id', config.id);

        if (error) {
            alert("Erro: " + error.message);
        } else {
            setConfig(newConfig);
            // Feedback visual sutil em vez de alert chato
            if (newConfig.is_maintenance === config.is_maintenance) {
                alert("✅ Informações atualizadas com sucesso!");
            }
        }
        setSaving(false);
    }

    if (loading) return <div className="p-8 pt-24 text-cyan-400 animate-pulse">Carregando...</div>;

    return (
        <main className="p-8 pt-24 text-white min-h-screen">
            <div className="container mx-auto max-w-4xl">

                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Settings className="text-gray-400" /> Configurações da Loja
                </h1>

                <div className="space-y-6">

                    {/* --- ZONA DE PERIGO (MANUTENÇÃO) --- */}
                    <div className={`border p-8 rounded-2xl transition-all duration-500 ${config.is_maintenance ? 'bg-red-900/20 border-red-500' : 'bg-gray-900/50 border-gray-800'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h2 className={`text-2xl font-bold flex items-center gap-2 ${config.is_maintenance ? 'text-red-500' : 'text-green-400'}`}>
                                    {config.is_maintenance ? <ShieldAlert size={28} /> : <Store size={28} />}
                                    {config.is_maintenance ? "LOJA PARADA" : "LOJA ONLINE"}
                                </h2>
                                <p className="text-gray-400 mt-2">
                                    {config.is_maintenance ? "Clientes veem a tela de manutenção." : "Loja funcionando normalmente."}
                                </p>
                            </div>
                            <button
                                onClick={toggleMaintenance}
                                disabled={saving}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${config.is_maintenance ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                            >
                                <Power size={20} /> {config.is_maintenance ? "ATIVAR LOJA" : "PARAR LOJA"}
                            </button>
                        </div>
                    </div>

                    {/* --- DADOS DA LOJA (AGORA FUNCIONA DE VERDADE) --- */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Store size={20} className="text-cyan-400" /> Identidade & Contato
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1">Nome da Loja</label>
                                <input
                                    value={config.store_name}
                                    onChange={(e) => setConfig({ ...config, store_name: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-cyan-500 outline-none"
                                    placeholder="Ex: Future Store"
                                />
                                <p className="text-xs text-gray-600 mt-1">Isso atualizará o rodapé e títulos do site.</p>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Mail size={12} /> E-mail de Suporte</label>
                                <input
                                    value={config.support_email}
                                    onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Phone size={12} /> Telefone / WhatsApp</label>
                                <input
                                    value={config.phone}
                                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><MapPin size={12} /> Endereço Físico</label>
                                <input
                                    value={config.address}
                                    onChange={(e) => setConfig({ ...config, address: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Instagram size={12} /> Instagram URL</label>
                                <input
                                    value={config.instagram_url}
                                    onChange={(e) => setConfig({ ...config, instagram_url: e.target.value })}
                                    className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
                            <button
                                onClick={() => saveSettings(config)}
                                disabled={saving}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
                            >
                                {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Save size={20} />}
                                Salvar Informações
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}