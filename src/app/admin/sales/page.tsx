"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle, Truck, MapPin, Copy, X, User,
    Ban, Box, Ruler, Loader2, CreditCard, QrCode, AlertTriangle
} from "lucide-react";

export default function SalesPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [updating, setUpdating] = useState<number | null>(null); // Para mostrar loading no botão específico

    // Modais
    const [selectedOrderForShipping, setSelectedOrderForShipping] = useState<any | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        setErrorMsg("");

        const { data, error } = await supabase
            .from("orders")
            .select(`
                *,
                customers (name, email, address, number, complement, neighborhood, city, state, zip),
                order_items (
                    quantity, price,
                    products (name, image_url, weight, height, width, length),
                    product_variants (color_name) 
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro:", error.message);
            setErrorMsg("Erro ao carregar pedidos. Verifique o console.");
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }

    // --- FUNÇÃO ATUALIZADA COM RASTREIO ---
    async function updateStatus(orderId: number, newStatus: string) {
        let trackingCode = null;

        // 1. Se for cancelar, pede confirmação
        if (newStatus === 'canceled' && !confirm("Deseja realmente CANCELAR este pedido?")) return;

        // 2. Se for enviar, PEDE O CÓDIGO DE RASTREIO
        if (newStatus === 'shipped') {
            trackingCode = prompt("📦 Informe o Código de Rastreio (Ex: AB123456BR):");
            if (!trackingCode) return alert("É necessário informar o rastreio para marcar como enviado.");
        }

        setUpdating(orderId);

        // 3. Atualiza no Banco
        const updateData: any = { status: newStatus };
        if (trackingCode) updateData.tracking_code = trackingCode;

        const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);

        if (!error) {
            // Atualiza a lista localmente para parecer instantâneo
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus, tracking_code: trackingCode || o.tracking_code } : o));

            // --- AQUI ENTRARÁ O DISPARO DE E-MAIL FUTURAMENTE ---
            if (newStatus === 'shipped') {
                // await fetch('/api/emails/send-tracking', { ... }) 
                alert("Status atualizado! (E-mail de rastreio seria enviado aqui)");
            }
        } else {
            alert("Erro ao atualizar status.");
        }
        setUpdating(null);
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return { day: '-', year: '-', time: '-' };
        const date = new Date(dateString);
        return {
            day: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date),
            year: date.getFullYear(),
            time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/50';
            case 'shipped': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'delivered': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'canceled': return 'bg-red-500/20 text-red-400 border-red-500/50';
            default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        }
    };

    return (
        <main className="p-4 md:p-8 pt-24 text-white min-h-screen">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <CheckCircle className="text-green-400" /> Gestão de Vendas
                </h1>

                {errorMsg && (
                    <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-center gap-3 text-yellow-200 text-sm">
                        <AlertTriangle size={20} /> {errorMsg}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Loader2 className="animate-spin" /> Carregando pedidos...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const dateObj = formatDate(order.created_at);
                            const productsTotal = (order.order_items || []).reduce((acc: number, item: any) => acc + (item.quantity * (item.price || 0)), 0);
                            const finalTotal = productsTotal + (order.shipping_cost || 0) - (order.discount || 0); // Ajuste para desconto

                            const custData = Array.isArray(order.customers) ? order.customers[0] : order.customers;
                            const customerName = custData?.name || order.customer_name;

                            return (
                                <div key={order.id} className={`bg-gray-900/60 border rounded-2xl overflow-hidden transition-all shadow-xl flex flex-col md:flex-row ${order.status === 'canceled' ? 'opacity-50 border-red-900/30' : 'border-gray-800 hover:border-cyan-500/30'}`}>

                                    <div className="p-6 bg-black/40 border-r border-gray-800 flex flex-col justify-center items-center min-w-[120px] gap-2">
                                        <span className="text-gray-500 text-xs font-bold uppercase">{dateObj.year}</span>
                                        <span className="text-2xl font-bold text-white">{dateObj.day}</span>
                                        <span className="text-cyan-400 text-xs font-mono bg-cyan-900/20 px-2 py-1 rounded">{dateObj.time}</span>
                                        <div className={`mt-2 px-3 py-1 rounded-full border text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.status)}`}>
                                            {order.status === 'paid' ? 'PAGO' : order.status === 'pending' ? 'PENDENTE' : order.status === 'shipped' ? 'ENVIADO' : order.status}
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Pedido #{order.id}</h3>
                                                    {/* MOSTRA CÓDIGO DE RASTREIO SE EXISTIR */}
                                                    {order.tracking_code && (
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-blue-400 font-mono bg-blue-900/20 px-2 py-1 rounded w-fit">
                                                            <Truck size={12} /> {order.tracking_code}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Valor Total</p>
                                                    <p className="text-xl font-bold text-green-400">R$ {finalTotal.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg">
                                                    <User size={12} className="text-cyan-400" /> {customerName}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-1.5 rounded-lg">
                                                    {order.payment_method === 'pix' ? <QrCode size={12} className="text-green-400" /> : <CreditCard size={12} className="text-cyan-400" />}
                                                    {order.payment_method?.toUpperCase() || 'MANUAL'}
                                                </div>
                                                {order.coupon_code && (
                                                    <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-900/50 px-3 py-1.5 rounded-lg font-bold">
                                                        CUPOM: {order.coupon_code}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                {(order.order_items || []).map((item: any, idx: number) => (
                                                    <p key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                                                        <span className="text-gray-600 font-bold">{item.quantity}x</span>
                                                        {item.products?.name}
                                                        <span className="text-[10px] bg-gray-800 px-1.5 rounded text-cyan-400 uppercase">{item.product_variants?.color_name}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4 gap-2">
                                            <button
                                                onClick={() => setSelectedOrderForShipping(order)}
                                                className="flex items-center gap-2 text-xs md:text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
                                            >
                                                <MapPin size={16} /> Ver Endereço
                                            </button>

                                            <div className="flex gap-2">
                                                {/* BOTÕES DE AÇÃO (Lógica de Status) */}
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'paid')}
                                                        disabled={updating === order.id}
                                                        className="text-xs font-bold bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg disabled:opacity-50"
                                                    >
                                                        {updating === order.id ? <Loader2 className="animate-spin" size={14} /> : "Confirmar Pago"}
                                                    </button>
                                                )}

                                                {order.status === 'paid' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'shipped')}
                                                        disabled={updating === order.id}
                                                        className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {updating === order.id ? <Loader2 className="animate-spin" size={14} /> : <><Truck size={12} /> Enviar</>}
                                                    </button>
                                                )}

                                                {order.status === 'shipped' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'delivered')}
                                                        disabled={updating === order.id}
                                                        className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {updating === order.id ? <Loader2 className="animate-spin" size={14} /> : "Marcar Entregue"}
                                                    </button>
                                                )}

                                                {order.status !== 'canceled' && order.status !== 'delivered' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'canceled')}
                                                        disabled={updating === order.id}
                                                        className="p-2 bg-red-900/20 text-red-500 rounded-lg border border-red-900/30 hover:bg-red-900/40 disabled:opacity-50"
                                                    >
                                                        <Ban size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {selectedOrderForShipping && (
                    <ShippingModal
                        order={selectedOrderForShipping}
                        onClose={() => setSelectedOrderForShipping(null)}
                    />
                )}
            </div>
        </main>
    );
}

// MANTENHA O SHIPPING MODAL E COPY FIELD IGUAIS AO SEU CÓDIGO ORIGINAL
// (Eles estavam ótimos, apenas copiei a lógica principal acima)
function ShippingModal({ order, onClose }: { order: any, onClose: () => void }) {
    const custRaw = Array.isArray(order.customers) ? order.customers[0] : order.customers;
    const customer = custRaw || {};
    const fallbackAddress = order.customer_address || "";

    const [viewingProduct, setViewingProduct] = useState<any | null>(null);

    const extractZip = (addr: string) => {
        const match = addr ? addr.match(/\d{5}-?\d{3}/) : null;
        return match ? match[0] : "";
    };

    const dataToDisplay = [
        { label: "Destinatário", value: customer.name || order.customer_name },
        { label: "E-mail", value: customer.email || order.customer_email },
        { separator: true },
        { label: "CEP", value: customer.zip || extractZip(fallbackAddress) || "Não informado" },
        { label: "Endereço", value: customer.address || fallbackAddress },
        { label: "Número", value: customer.number || "S/N" },
        { label: "Complemento", value: customer.complement || "Sem complemento" },
        { label: "Bairro", value: customer.neighborhood || "-" },
        { label: "Cidade / UF", value: `${customer.city || "-"} / ${customer.state || "-"}` },
        { separator: true },
        { label: "Método de Envio", value: order.shipping_method || "Padrão" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

                <div className="bg-black/50 p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Truck className="text-cyan-400" size={20} /> Detalhes Logísticos
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {order.payment_method && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl mb-4">
                            <p className="text-[10px] text-green-500 font-bold uppercase mb-2 tracking-widest">Informação de Pagamento</p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white flex items-center gap-2 uppercase">
                                    {order.payment_method === 'pix' ? <QrCode size={14} /> : <CreditCard size={14} />}
                                    {order.payment_method}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">ID: {order.payment_id?.slice(-8)}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {dataToDisplay.map((item, idx) => (
                            item.separator ? <hr key={idx} className="border-gray-800 my-2" /> : <CopyField key={idx} label={item.label || ""} value={item.value || ""} />
                        ))}
                    </div>

                    <div className="pt-4">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <Box size={14} /> Conferência de Itens
                        </h4>
                        <div className="space-y-2">
                            {order.order_items.map((item: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setViewingProduct(item)}
                                    className="w-full text-left bg-black border border-gray-800 hover:border-cyan-500 p-3 rounded-xl flex justify-between items-center transition-all group"
                                >
                                    <div>
                                        <p className="font-bold text-white text-sm group-hover:text-cyan-400">
                                            {item.quantity}x {item.products?.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 uppercase">{item.product_variants?.color_name}</p>
                                    </div>
                                    <Ruler size={16} className="text-gray-600 group-hover:text-cyan-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Raio-X do Produto (Modal dentro do Modal) */}
            {viewingProduct && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                    <div className="bg-gray-900 border border-gray-600 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setViewingProduct(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors"><X size={20} /></button>
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-bold text-white">{viewingProduct.products?.name}</h3>
                            <p className="text-cyan-400 text-xs font-bold uppercase">{viewingProduct.product_variants?.color_name}</p>
                        </div>
                        <div className="aspect-square bg-black rounded-xl border border-gray-700 overflow-hidden mb-4 relative">
                            {viewingProduct.products?.image_url ? (
                                <img src={viewingProduct.products.image_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-700"><Box size={48} /></div>
                            )}
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <h4 className="text-[10px] text-gray-400 uppercase font-bold mb-3 flex items-center gap-2"><Ruler size={14} /> Medidas Unitárias</h4>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><span className="text-gray-500 block">Peso</span><span className="text-white font-mono">{viewingProduct.products?.weight || "-"} kg</span></div>
                                <div><span className="text-gray-500 block">Dimensões (AxLxC)</span><span className="text-white font-mono">{viewingProduct.products?.height || 0}x{viewingProduct.products?.width || 0}x{viewingProduct.products?.length || 0} cm</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CopyField({ label, value }: { label: string, value: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-600 uppercase font-bold ml-1">{label}</span>
            <div className="flex gap-2">
                <div className="flex-1 bg-black border border-gray-700 rounded-lg p-2 text-xs text-white truncate font-mono">{value}</div>
                <button onClick={handleCopy} className={`p-2 rounded-lg border transition-all ${copied ? "bg-green-500/20 border-green-500 text-green-400" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"}`}>
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
}