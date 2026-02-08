"use client";

import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "../app/store/cartStore";
import {
    ShoppingCart, Ruler, AlertCircle, Check, X, Star, Truck, ShieldCheck
} from "lucide-react";
import { SizeGuideModal } from "@/components/SizeGuideModal";

interface ProductDetailClientProps {
    product: any;
    variants: any[];
    totalStock: number;
}

export function ProductDetailClient({ product, variants, totalStock }: ProductDetailClientProps) {
    const { addToCart, toggleCart } = useCartStore();

    // 1. Inicializa com a variante que tiver qualquer tipo de estoque
    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        return variants.find(v => {
            const qtySizes = v.product_stock?.reduce((acc:number, s:any) => acc + (Number(s.quantity)||0), 0) || 0;
            const qtyGeneral = Number(v.stock) || 0;
            return qtySizes > 0 || qtyGeneral > 0;
        }) || variants[0] || null;
    });

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // 2. Dados da Variante Atual
    const currentVariantStocks = useMemo(() => selectedVariant?.product_stock || [], [selectedVariant]);
    const directStock = Number(selectedVariant?.stock) || 0;
    
    // Verifica se existem tamanhos para mostrar na tela (apenas visual)
    const showSizeSelector = currentVariantStocks.some((s: any) => (Number(s.quantity) || 0) > 0);

    // 3. Efeito: Auto-seleção de tamanho único (Opcional, mas ajuda UX)
    useEffect(() => {
        setSelectedSize(""); // Reseta ao trocar variante
        if (showSizeSelector && currentVariantStocks.length === 1) {
             const onlySize = currentVariantStocks[0];
             if (Number(onlySize.quantity) > 0) setSelectedSize(onlySize.size);
        }
    }, [selectedVariant, showSizeSelector, currentVariantStocks]);

    // 4. Auxiliares
    const categoryName = (product.subcategories?.categories?.name || "").toLowerCase();
    const showSizeGuide = ["roupa", "moda", "calça", "tênis", "camiseta"].some(tag => categoryName.includes(tag));
    const isFootwear = ["calçado", "tênis", "sapato"].some(tag => categoryName.includes(tag));

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // --- LÓGICA DE COMPRA HÍBRIDA (CORRIGIDA) ---
    const handleAddToCart = () => {
        if (totalStock <= 0) {
            showMessage("Produto esgotado!", "error");
            return;
        }

        // TENTATIVA 1: Compra por Tamanho (Prioridade se usuário selecionou)
        if (selectedSize) {
            const sizeObj = currentVariantStocks.find((s: any) => s.size === selectedSize);
            if (sizeObj && (Number(sizeObj.quantity) > 0)) {
                addToCart({
                    id: sizeObj.id,
                    name: product.name,
                    price: product.price,
                    image_url: selectedVariant?.image_url || product.image_url,
                    quantity: 1,
                    variant_id: selectedVariant?.id,
                    color: selectedVariant?.color_name,
                    size: selectedSize
                });
                showMessage("Adicionado ao carrinho!");
                toggleCart();
                return;
            } else {
                showMessage("Tamanho selecionado indisponível.", "error");
                return;
            }
        }

        // TENTATIVA 2: Compra Direta (Bonés/Acessórios - Sem tamanho selecionado)
        // Se o usuário NÃO selecionou tamanho, verificamos se a variante tem estoque direto.
        if (directStock > 0) {
             addToCart({
                id: selectedVariant?.id,
                name: product.name,
                price: product.price,
                image_url: selectedVariant?.image_url || product.image_url,
                quantity: 1,
                variant_id: selectedVariant?.id,
                color: selectedVariant?.color_name,
                size: null // Importante: vai como null para o carrinho
            });
            showMessage("Adicionado ao carrinho!");
            toggleCart();
            return;
        }

        // FALHA: Se chegou aqui, não tinha tamanho selecionado E não tinha estoque direto
        if (showSizeSelector) {
            showMessage("Por favor, selecione um tamanho.", "error");
        } else {
            showMessage("Produto indisponível nesta opção.", "error");
        }
    };

    return (
        <div className="relative">
            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-[#0a0a0a] border-cyan-500/50 text-cyan-400' : 'bg-[#0a0a0a] border-red-500/50 text-red-400'
                }`}>
                    {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-bold text-xs uppercase tracking-widest">{toast.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* IMAGEM */}
                <div className="aspect-square relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                    <img
                        src={selectedVariant?.image_url || product.image_url}
                        className={`w-full h-full object-cover ${totalStock <= 0 ? 'grayscale opacity-40' : ''}`}
                    />
                    {totalStock <= 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-black uppercase text-red-500 border-4 border-red-500 px-8 py-4 -rotate-12 bg-black/50 backdrop-blur">Esgotado</span>
                        </div>
                    )}
                </div>

                {/* INFO E AÇÕES */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase text-white tracking-tighter leading-none">{product.name}</h1>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 inline-block">
                        <span className="text-4xl font-black text-cyan-400">R$ {product.price.toFixed(2)}</span>
                    </div>

                    {/* SELETOR DE VARIANTES */}
                    {variants.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                Opção: <span className="text-white ml-2">{selectedVariant?.color_name || "Padrão"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {variants.map((v) => {
                                    const hasAnyStock = (Number(v.stock) > 0) || (v.product_stock?.some((s:any) => Number(s.quantity) > 0));
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                                                selectedVariant?.id === v.id 
                                                ? 'bg-white text-black border-white shadow-xl' 
                                                : !hasAnyStock ? 'opacity-30 border-dashed border-white/10' : 'border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            {v.color_name || "Única"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SELETOR DE TAMANHOS (SÓ RENDERIZA SE TIVER TAMANHOS COM ESTOQUE) */}
                    {showSizeSelector && (
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                Tamanho: <span className="text-cyan-400 ml-2">{selectedSize || "Selecione"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {currentVariantStocks.map((s: any) => {
                                    const qty = Number(s.quantity) || 0;
                                    // Se a quantidade for 0, não mostramos ou mostramos desabilitado.
                                    // Para limpar a UI, podemos mostrar só os > 0, ou todos desabilitados.
                                    return (
                                        <button
                                            key={s.id}
                                            disabled={qty <= 0}
                                            onClick={() => setSelectedSize(s.size)}
                                            className={`min-w-[65px] h-[55px] flex items-center justify-center rounded-xl border text-xs font-black uppercase transition-all ${
                                                selectedSize === s.size 
                                                    ? 'bg-cyan-500 text-black border-cyan-500' 
                                                    : qty <= 0 
                                                        ? 'opacity-20 cursor-not-allowed border-dashed' 
                                                        : 'border-white/10 text-white hover:border-cyan-500'
                                            }`}
                                        >
                                            {s.size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {showSizeGuide && (
                        <div className="mb-6">
                            <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black text-gray-400 hover:text-cyan-400 flex items-center gap-2 uppercase tracking-widest transition-colors">
                                <Ruler size={16} /> Ver tabela de medidas
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={totalStock <= 0}
                        className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${
                            totalStock <= 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95'
                        }`}
                    >
                        <ShoppingCart size={22} />
                        {totalStock <= 0 ? "Esgotado" : "Adicionar à Bag"}
                    </button>

                    {/* INFOS EXTRAS */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <Truck className="text-cyan-400" size={20} />
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-300">Entrega Rápida</p>
                                <p className="text-[9px] text-gray-500">Envio imediato</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <ShieldCheck className="text-cyan-400" size={20} />
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-300">Garantia Total</p>
                                <p className="text-[9px] text-gray-500">7 dias para troca</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} type={isFootwear ? "footwear" : "clothing"} />
        </div>
    );
}