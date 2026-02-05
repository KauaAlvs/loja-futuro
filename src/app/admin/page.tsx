"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    DollarSign, ShoppingBag, Users, TrendingUp,
    Package, ArrowUpRight, ArrowDownRight, Clock, Calendar
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);

    // Dados
    const [kpis, setKpis] = useState({
        revenue: 0,
        ordersCount: 0,
        avgTicket: 0,
        customersCount: 0
    });

    const [recentSales, setRecentSales] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [topProduct, setTopProduct] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        setLoading(true);

        const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, created_at, status, customer_name, customer_email')
            .order('created_at', { ascending: false });

        const { count: customersCount } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });

        const { data: items } = await supabase
            .from('order_items')
            .select('product_name, quantity, price');

        if (orders && items) {
            processMetrics(orders, customersCount || 0, items);
        }

        setLoading(false);
    }

    function processMetrics(orders: any[], customersCount: number, items: any[]) {
        // KPI: Receita
        const revenue = orders.reduce((acc, order) => acc + (order.total_amount || 0), 0);
        // KPI: Pedidos
        const ordersCount = orders.length;
        // KPI: Ticket Médio
        const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;

        setKpis({ revenue, ordersCount, avgTicket, customersCount });

        // Timeline
        setRecentSales(orders.slice(0, 5));

        // Gráfico (7 dias)
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const chart = last7Days.map(date => {
            const dayRevenue = orders
                .filter(o => o.created_at.startsWith(date))
                .reduce((acc, o) => acc + (o.total_amount || 0), 0);

            // Data curta para mobile (DD/MM)
            const dayFormatted = new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            return { name: dayFormatted, total: dayRevenue };
        });
        setChartData(chart);

        // Top Produto
        const productMap: Record<string, number> = {};
        items.forEach(item => {
            if (!productMap[item.product_name]) productMap[item.product_name] = 0;
            productMap[item.product_name] += item.quantity;
        });

        const sortedProducts = Object.entries(productMap).sort((a, b) => b[1] - a[1]);
        if (sortedProducts.length > 0) {
            setTopProduct({ name: sortedProducts[0][0], sales: sortedProducts[0][1] });
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-400 bg-green-500/10';
            case 'pending': return 'text-yellow-400 bg-yellow-500/10';
            case 'shipped': return 'text-blue-400 bg-blue-500/10';
            case 'delivered': return 'text-purple-400 bg-purple-500/10';
            case 'canceled': return 'text-red-400 bg-red-500/10';
            default: return 'text-gray-400 bg-gray-500/10';
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-cyan-400 animate-pulse">Carregando...</div>;
    }

    return (
        <main className="p-4 md:p-8 pt-24 text-white min-h-screen pb-20">
            <div className="container mx-auto max-w-7xl">

                {/* HEADER COMPACTO */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-400 text-xs md:text-sm">Visão geral da loja.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-xs md:text-sm text-gray-400 self-end md:self-auto">
                        <Calendar size={14} /> <span>30 dias</span>
                    </div>
                </div>

                {/* --- 1. CARDS DE KPI OTIMIZADOS --- */}
                {/* Mobile: grid-cols-2 (Lado a lado, compacto). Desktop: grid-cols-4 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                    <KpiCard
                        title="Receita"
                        value={`R$ ${kpis.revenue.toFixed(0)}`} // Remove centavos no card principal para economizar espaço
                        icon={DollarSign}
                        trend="+12%"
                        color="text-cyan-400"
                    />
                    <KpiCard
                        title="Vendas"
                        value={kpis.ordersCount.toString()}
                        icon={ShoppingBag}
                        trend="+5%"
                        color="text-purple-400"
                    />
                    <KpiCard
                        title="Médio"
                        value={`R$ ${kpis.avgTicket.toFixed(0)}`}
                        icon={TrendingUp}
                        trend="-2%"
                        color="text-green-400"
                        trendNegative
                    />
                    <KpiCard
                        title="Clientes"
                        value={kpis.customersCount.toString()}
                        icon={Users}
                        trend="+8"
                        color="text-yellow-400"
                    />
                </div>

                {/* --- 2. GRÁFICO E TIMELINE --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">

                    {/* GRÁFICO (Melhorado para Mobile) */}
                    <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 p-4 md:p-6 rounded-2xl shadow-xl">
                        <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-cyan-400" /> Faturamento (7 dias)
                        </h3>
                        {/* Altura reduzida no mobile (250px) para não empurrar tudo pra baixo */}
                        <div className="h-[250px] md:h-[300px] w-full -ml-4 md:ml-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#6b7280" // Cinza mais escuro
                                        fontSize={10} // Fonte minúscula no mobile
                                        tickLine={false}
                                        axisLine={false}
                                        interval="preserveStartEnd" // Garante que o primeiro e ultimo dia apareçam
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value}`}
                                        width={40} // Largura fixa menor
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                        itemStyle={{ color: '#22d3ee' }}
                                        formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, ""]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#06b6d4"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* TIMELINE (Simplificada para Mobile) */}
                    <div className="bg-gray-900/50 border border-gray-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col">
                        <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-purple-400" /> Últimas Vendas
                        </h3>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 md:space-y-4 pr-1">
                            {recentSales.length === 0 ? (
                                <p className="text-gray-500 text-sm text-center">Vazio.</p>
                            ) : (
                                recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-gray-800/50">

                                        {/* Avatar menor no mobile */}
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-300 flex-shrink-0">
                                            {sale.customer_name ? sale.customer_name.substring(0, 2).toUpperCase() : "??"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs md:text-sm font-bold text-white truncate">
                                                {sale.customer_name || "Cliente"}
                                            </p>
                                            {/* SACRIFÍCIO: Esconde o e-mail no mobile para não quebrar linha */}
                                            <p className="text-xs text-gray-500 truncate hidden sm:block">
                                                {sale.customer_email}
                                            </p>
                                            {/* No mobile, mostra o ID do pedido no lugar do email */}
                                            <p className="text-[10px] text-gray-600 sm:hidden">
                                                #{sale.id}
                                            </p>
                                        </div>

                                        <div className="text-right flex flex-col items-end">
                                            <p className="text-xs md:text-sm font-bold text-white">
                                                R$ {(sale.total_amount || 0).toFixed(0)}
                                            </p>
                                            {/* Badge menor no mobile */}
                                            <span className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${getStatusColor(sale.status)}`}>
                                                {sale.status === 'pending' ? 'Pendente' : sale.status === 'paid' ? 'Pago' : sale.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 3. PRODUTO DESTAQUE --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-4 md:p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase mb-1 flex items-center gap-2">
                                <Package size={14} className="text-yellow-400" /> Campeão de Vendas
                            </p>
                            <h3 className="text-lg md:text-2xl font-bold text-white mb-1 line-clamp-1">
                                {topProduct ? topProduct.name : "-"}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500">
                                {topProduct ? `${topProduct.sales} unid.` : "..."}
                            </p>
                        </div>
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package size={24} className="text-yellow-400" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-gray-800 p-4 md:p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-1">Vendas</h3>
                            <p className="text-gray-400 text-xs md:text-sm mb-3">Gerencie seus pedidos.</p>
                            <a href="/admin/sales" className="text-xs md:text-sm font-bold text-cyan-400 flex items-center gap-1 p-2 bg-cyan-900/20 rounded-lg w-fit">
                                Acessar <ArrowUpRight size={14} />
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

// --- CARD KPI RESPONSIVO ---
function KpiCard({ title, value, icon: Icon, trend, color, trendNegative = false }: any) {
    return (
        <div className="bg-gray-900/50 border border-gray-800 p-4 md:p-6 rounded-2xl hover:border-gray-700 transition-all flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2 md:mb-4">
                <div>
                    <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 truncate">
                        {title}
                    </p>
                    <h3 className="text-xl md:text-3xl font-bold text-white truncate">
                        {value}
                    </h3>
                </div>
                {/* Ícone menor no mobile */}
                <div className={`p-2 md:p-3 rounded-xl bg-opacity-10 ${color.replace('text-', 'bg-')} ${color}`}>
                    <Icon size={18} className="md:hidden" />
                    <Icon size={24} className="hidden md:block" />
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] md:text-xs">
                <span className={`flex items-center gap-1 font-bold ${trendNegative ? 'text-red-400' : 'text-green-400'}`}>
                    {trendNegative ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                    {trend}
                </span>
                {/* Esconde texto auxiliar no mobile para limpar visual */}
                <span className="text-gray-600 hidden md:inline">vs mês anterior</span>
            </div>
        </div>
    );
}