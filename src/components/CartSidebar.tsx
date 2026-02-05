"use client";

import { useCartStore } from "../app/store/cartStore";
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from "lucide-react"; // Importei ArrowLeft
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartSidebar() {
    const { items, isOpen, toggleCart, removeItem, updateQuantity } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <>
            {/* OVERLAY */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={toggleCart}
            />

            {/* SIDEBAR */}
            <aside
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-gray-800 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >

                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="text-cyan-400" /> Seu Carrinho
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{items.length}</span>
                    </h2>
                    <button onClick={toggleCart} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* LISTA DE ITENS */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <ShoppingBag size={64} className="text-gray-700" />
                            <p>Seu carrinho está vazio.</p>
                            <button onClick={toggleCart} className="text-cyan-400 underline font-bold">
                                Começar a comprar
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.variantId}-${item.size}`} className="flex gap-4 group animate-in slide-in-from-right-4 duration-300">

                                {/* IMAGEM */}
                                <div className="relative w-20 h-20 bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex-shrink-0">
                                    {item.image ? (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">Sem foto</div>
                                    )}
                                </div>

                                {/* DETALHES */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-white truncate text-sm">{item.name}</h3>

                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {item.color && (
                                                <span className="text-[10px] text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                                                    {item.color}
                                                </span>
                                            )}
                                            {item.size && (
                                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                                    Tam: {item.size}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <p className="font-bold text-white text-sm">R$ {item.price.toFixed(2)}</p>

                                        <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1 border border-gray-800">
                                            <button
                                                // Atualiza a Store antiga usando variantId (se tiver ID, Tamanho, etc, ajuste aqui)
                                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                                className="p-1 hover:text-cyan-400 disabled:opacity-50 text-gray-400"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                                className="p-1 hover:text-cyan-400 text-gray-400"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeItem(item.variantId)}
                                    className="text-gray-600 hover:text-red-500 transition-colors self-start p-1"
                                    title="Remover item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* RODAPÉ */}
                {items.length > 0 && (
                    <div className="p-6 bg-gray-900 border-t border-gray-800">
                        <div className="flex justify-between items-center text-lg font-bold mb-6">
                            <span>Total</span>
                            <span className="text-cyan-400">R$ {total.toFixed(2)}</span>
                        </div>

                        <div className="space-y-3">
                            {/* 1. BOTÃO CONTINUAR COMPRANDO (NOVO) */}
                            <button
                                onClick={toggleCart} // Apenas fecha o sidebar
                                className="w-full bg-transparent border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-800 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                <ArrowLeft size={18} /> Continuar Comprando
                            </button>

                            {/* 2. BOTÃO FINALIZAR */}
                            <Link
                                href="/checkout"
                                onClick={toggleCart}
                                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Finalizar Compra <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
}