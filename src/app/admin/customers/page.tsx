"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Users, Search, MapPin, Mail, ShoppingBag,
    TrendingUp, Calendar, User
} from "lucide-react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filtro de Busca
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCustomers(customers);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredCustomers(customers.filter(c =>
                (c.name && c.name.toLowerCase().includes(lower)) ||
                (c.email && c.email.toLowerCase().includes(lower)) ||
                (c.city && c.city.toLowerCase().includes(lower)) ||
                (c.neighborhood && c.neighborhood.toLowerCase().includes(lower))
            ));
        }
    }, [searchTerm, customers]);

    async function fetchCustomers() {
        setLoading(true);

        const { data, error } = await supabase
            .from("customers")
            .select(`
                *,
                orders (id, total_amount, created_at, status)
            `);

        if (error) {
            console.error("Erro ao buscar clientes:", error);
        } else {
            const processed = (data || []).map((customer: any) => {
                const orders = customer.orders || [];

                // Total gasto (ignora cancelados)
                const totalSpent = orders.reduce((acc: number, order: any) => {
                    return order.status !== 'canceled' ? acc + (order.total_amount || 0) : acc;
                }, 0);

                // Último pedido
                const sortedOrders = [...orders].sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                const lastOrderDate = sortedOrders.length > 0 ? sortedOrders[0].created_at : null;

                return {
                    ...customer,
                    stats: {
                        ordersCount: orders.length,
                        totalSpent,
                        lastOrderDate
                    }
                };
            });

            // Ordena por quem gastou mais
            processed.sort((a: any, b: any) => b.stats.totalSpent - a.stats.totalSpent);

            setCustomers(processed);
            setFilteredCustomers(processed);
        }
        setLoading(false);
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "Nunca";
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', year: '2-digit'
        });
    };

    return (
        <main className="p-4 md:p-8 pt-24 text-white min-h-screen">
            <div className="container mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                            <Users className="text-cyan-400" /> Base de Clientes
                        </h1>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">
                            Gerencie os {customers.length} clientes cadastrados na loja.
                        </p>
                    </div>

                    {/* BARRA DE BUSCA */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-3 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email, cidade..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-cyan-500 transition-colors text-sm"
                        />
                    </div>
                </div>

                {/* LISTA DE CLIENTES */}
                {loading ? (
                    <div className="flex justify-center items-center h-64 text-cyan-400 gap-2 animate-pulse">
                        <TrendingUp size={20} /> Carregando base de dados...
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800">
                        <Users size={48} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500">Nenhum cliente encontrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                className="bg-gray-900/50 border border-gray-800 p-4 md:p-6 rounded-2xl hover:border-cyan-500/30 transition-all flex flex-col lg:flex-row items-start lg:items-center gap-6 group overflow-hidden"
                            >
                                {/* 1. DADOS PESSOAIS */}
                                <div className="flex items-center gap-4 w-full lg:w-[320px] shrink-0 min-w-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black border border-gray-700 flex items-center justify-center text-lg font-bold text-gray-300 shrink-0 uppercase">
                                        {customer.name ? customer.name.substring(0, 2) : <User size={20} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-white text-base md:text-lg group-hover:text-cyan-400 transition-colors truncate">
                                            {customer.name || "Cliente Sem Nome"}
                                        </h3>
                                        <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 truncate">
                                            <Mail size={12} className="shrink-0" /> {customer.email}
                                        </p>
                                    </div>
                                </div>

                                {/* 2. ENDEREÇO (CORRIGIDO: 'address') */}
                                <div className="w-full lg:flex-1 min-w-0 border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold bg-gray-800 px-1.5 rounded">Endereço</span>
                                        {customer.state && <span className="text-[10px] text-cyan-400 uppercase font-bold border border-cyan-900 px-1.5 rounded">{customer.state}</span>}
                                    </div>

                                    <div className="flex items-start gap-2 text-sm text-gray-300">
                                        <MapPin size={16} className="text-gray-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="leading-tight">
                                                {/* AQUI ESTAVA 'adress', AGORA É 'address' */}
                                                {customer.address}
                                                {customer.number ? `, ${customer.number}` : ''}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {customer.neighborhood ? `${customer.neighborhood} - ` : ''}
                                                {customer.city}
                                            </p>
                                            <p className="text-[10px] text-gray-600 font-mono mt-1">CEP: {customer.zip}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. ESTATÍSTICAS */}
                                <div className="w-full lg:w-auto grid grid-cols-3 gap-2 lg:flex lg:gap-8 border-t lg:border-t-0 lg:border-l border-gray-800 pt-4 lg:pt-0 lg:pl-8">

                                    {/* Pedidos */}
                                    <div className="text-center lg:text-left">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-center lg:justify-start gap-1">
                                            <ShoppingBag size={10} /> Pedidos
                                        </p>
                                        <span className="text-sm font-bold text-white bg-gray-800 px-2 py-0.5 rounded">
                                            {customer.stats.ordersCount}
                                        </span>
                                    </div>

                                    {/* LTV (Total Gasto) */}
                                    <div className="text-center lg:text-left min-w-[80px]">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-center lg:justify-start gap-1">
                                            <TrendingUp size={10} /> Total
                                        </p>
                                        <span className={`text-sm font-bold ${customer.stats.totalSpent > 1000 ? 'text-green-400' : 'text-white'}`}>
                                            R$ {customer.stats.totalSpent.toFixed(0)}
                                        </span>
                                    </div>

                                    {/* Data */}
                                    <div className="text-center lg:text-left">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 flex items-center justify-center lg:justify-start gap-1">
                                            <Calendar size={10} /> Último
                                        </p>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {formatDate(customer.stats.lastOrderDate)}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}