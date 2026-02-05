"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TicketPercent, Plus, Trash2, Calendar, Users, Ban, CheckCircle } from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_count: number;
    usage_limit: number | null;
    min_purchase: number;
    expires_at: string | null;
    is_active: boolean;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Estado do Formulário
    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage", // ou 'fixed'
        discount_value: "",
        min_purchase: "0",
        usage_limit: "",
        expires_at: ""
    });

    // 1. Carregar Cupons
    async function fetchCoupons() {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setCoupons(data);
        setLoading(false);
    }

    useEffect(() => {
        fetchCoupons();
    }, []);

    // 2. Criar Cupom
    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase.from('coupons').insert([{
                code: formData.code.toUpperCase(), // Códigos sempre maiúsculos
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_purchase: parseFloat(formData.min_purchase),
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                expires_at: formData.expires_at || null,
                is_active: true
            }]);

            if (error) throw error;

            alert("Cupom criado com sucesso!");
            setIsModalOpen(false);
            setFormData({ code: "", discount_type: "percentage", discount_value: "", min_purchase: "0", usage_limit: "", expires_at: "" });
            fetchCoupons(); // Recarrega a lista

        } catch (error: any) {
            alert("Erro ao criar: " + error.message);
        } finally {
            setSaving(false);
        }
    }

    // 3. Deletar Cupom
    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja apagar este cupom?")) return;

        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) {
            alert("Erro ao apagar");
        } else {
            setCoupons(coupons.filter(c => c.id !== id));
        }
    }

    // 4. Alternar Status (Ativo/Inativo)
    async function toggleStatus(id: string, currentStatus: boolean) {
        const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
        if (!error) {
            setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
        }
    }

    return (
        <main className="p-8 pt-24 text-white min-h-screen bg-[#050505]">
            <div className="w-full max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3">
                            <TicketPercent className="text-cyan-400" size={32} />
                            Gestão de Cupons
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Crie códigos de desconto para campanhas ou compensações.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                    >
                        <Plus size={20} /> Novo Cupom
                    </button>
                </div>

                {/* Lista de Cupons */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Carregando cupons...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((coupon) => {
                            const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                            const isDepleted = coupon.usage_limit && coupon.usage_count >= coupon.usage_limit;
                            const statusColor = !coupon.is_active ? "text-gray-500 border-gray-800 opacity-50" : isExpired || isDepleted ? "text-red-400 border-red-900/30" : "text-cyan-400 border-cyan-900/30";

                            return (
                                <div key={coupon.id} className={`bg-[#0a0a0a] border rounded-2xl p-6 relative group transition-all hover:border-white/10 ${statusColor.includes('opacity') ? 'border-gray-800' : 'border-white/5'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className={`text-2xl font-black tracking-wider ${statusColor.split(' ')[0]}`}>
                                                {coupon.code}
                                            </h3>
                                            <p className="text-white font-bold text-lg">
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `R$ ${coupon.discount_value} OFF`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                            className={`p-2 rounded-lg transition-colors ${coupon.is_active ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-500'}`}
                                            title={coupon.is_active ? "Ativo" : "Inativo"}
                                        >
                                            {coupon.is_active ? <CheckCircle size={18} /> : <Ban size={18} />}
                                        </button>
                                    </div>

                                    <div className="space-y-2 text-xs text-gray-400 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} />
                                            <span>Usado: <b className="text-white">{coupon.usage_count}</b> {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "vezes (ilimitado)"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TicketPercent size={14} />
                                            <span>Mínimo: {coupon.min_purchase > 0 ? `R$ ${coupon.min_purchase}` : "Sem mínimo"}</span>
                                        </div>
                                        {coupon.expires_at && (
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                <span className={isExpired ? "text-red-500" : ""}>
                                                    Expira em: {new Date(coupon.expires_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="absolute top-6 right-16 p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* MODAL DE CRIAÇÃO */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#0f0f0f] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
                            <h2 className="text-2xl font-black mb-6">Novo Cupom</h2>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Código (Ex: PROMO10)</label>
                                    <input
                                        required
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none uppercase font-bold tracking-widest mt-1"
                                        placeholder="CÓDIGO"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none mt-1"
                                        >
                                            <option value="percentage">Porcentagem (%)</option>
                                            <option value="fixed">Valor Fixo (R$)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Valor</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.discount_value}
                                            onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none mt-1"
                                            placeholder={formData.discount_type === 'percentage' ? "10" : "50.00"}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Mínimo (R$)</label>
                                        <input
                                            type="number"
                                            value={formData.min_purchase}
                                            onChange={e => setFormData({ ...formData, min_purchase: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Limite de Uso</label>
                                        <input
                                            type="number"
                                            value={formData.usage_limit}
                                            onChange={e => setFormData({ ...formData, usage_limit: e.target.value })}
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none mt-1"
                                            placeholder="Ilimitado"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Validade (Opcional)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none mt-1"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        disabled={saving}
                                        className="flex-1 bg-cyan-600 text-white font-bold py-3 rounded-xl hover:bg-cyan-500"
                                    >
                                        {saving ? "Salvando..." : "Criar Cupom"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}