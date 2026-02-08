"use client";

import { useState, useEffect, useMemo } from "react";
import { useCartStore } from "../../../../app/store/cartStore";
import {
    ShoppingCart, Truck, ShieldCheck, Ruler,
    AlertCircle, Check, X, Star, Package
} from "lucide-react";
import { SizeGuideModal } from "@/components/SizeGuideModal";

interface ProductDetailClientProps {
    product: any;
    variants: any[];
    totalStock: number;
}

export function ProductDetailClient({ product, variants, totalStock }: ProductDetailClientProps) {
    const { addToCart, toggleCart } = useCartStore();

    // --- ESTADOS ---
    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        return variants.find(v => {
            const hasSizeStock = v.product_stock?.some((s: any) => s.quantity > 0);
            const hasGeneralStock = (v.stock || 0) > 0;
            return hasSizeStock || hasGeneralStock;
        }) || variants[0] || null;
    });

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // --- LÓGICA DE CATEGORIA E GUIA (DEFINIÇÃO GLOBAL NO COMPONENTE) ---
    const categoryName = (product.subcategories?.categories?.name || "").toLowerCase();
    const subcategoryName = (product.subcategories?.name || "").toLowerCase();

    // Definição de palavras-chave para detectar calçados
    const footwearKeywords = ["calçado", "tênis", "sapato", "bota", "salto", "chuteira", "sandália", "chinelo"];
    const isFootwear = footwearKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));
    
    // Definição de palavras-chave para detectar moda em geral (mostrar guia)
    const fashionKeywords = [...footwearKeywords, "roupa", "moda", "camiseta", "calça", "jaqueta", "moletom", "bermuda"];
    const showSizeGuide = fashionKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));

    const guideType = isFootwear ? "footwear" : "clothing";

    // --- LÓGICA DE ESTOQUE ---
    const currentVariantStocks = useMemo(() => selectedVariant?.product_stock || [], [selectedVariant]);
    const hasSizes = currentVariantStocks.length > 0;

    useEffect(() => {
        setSelectedSize("");
    }, [selectedVariant]);

    // --- AÇÕES ---
    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddToCart = () => {
        if (totalStock <= 0) {
            showMessage("Produto totalmente esgotado!", "error");
            return;
        }

        if (hasSizes && !selectedSize) {
            showMessage("Selecione um tamanho primeiro!", "error");
            return;
        }

        const targetStock = hasSizes 
            ? currentVariantStocks.find((s: any) => s.size === selectedSize)
            : null;

        addToCart({
            id: targetStock?.id || selectedVariant?.id,
            name: product.name,
            price: product.price,
            image_url: selectedVariant?.image_url || product.image_url,
            quantity: 1,
            variant_id: selectedVariant?.id,
            color: selectedVariant?.color_name,
            size: selectedSize || null
        });

        showMessage("Adicionado ao carrinho!");
        toggleCart();
    };

    const currentImage = selectedVariant?.image_url || product.image_url;

    return (
        <div className="relative">
            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-[#0a0a0a] border-cyan-500/50 text-cyan-400' : 'bg-[#0a0a0a] border-red-500/50 text-red-400'
                }`}>
                    {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-bold text-xs uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 hover:text-white"><X size={14} /></button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* COLUNA ESQUERDA: IMAGEM */}
                <div className="space-y-6">
                    <div className="aspect-square relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
                        <img
                            src={currentImage}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${totalStock === 0 ? 'grayscale opacity-40' : ''}`}
                        />
                        {totalStock === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-black uppercase text-red-500 tracking-widest border-4 border-red-500 px-8 py-4 -rotate-12 rounded-xl bg-black/50 backdrop-blur">
                                    Esgotado
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Galeria de Variantes */}
                    {variants.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                                        selectedVariant?.id === v.id ? 'border-cyan-400 scale-105 opacity-100' : 'border-white/10 opacity-40 hover:opacity-100'
                                    }`}
                                >
                                    <img src={v.image_url || product.image_url} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: INFOS */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-cyan-400 mb-4">
                        <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                        <span className="text-[10px] text-gray-500 ml-2 font-bold uppercase">Qualidade Garantida</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase text-white leading-none">
                        {product.name}
                    </h1>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 inline-block w-full">
                        <span className="text-4xl font-black text-cyan-400 tracking-tight">R$ {product.price.toFixed(2)}</span>
                    </div>

                    {/* SELETOR DE CORES / OPÇÕES */}
                    {variants.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                Opção: <span className="text-white ml-2">{selectedVariant?.color_name || "Padrão"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                            selectedVariant?.id === v.id ? 'bg-white text-black border-white shadow-lg' : 'border-white/10 text-gray-400 hover:border-white/30'
                                        }`}
                                    >
                                        {v.color_name || "Única"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SELETOR DE TAMANHOS (SÓ SE EXISTIR NO BANCO) */}
                    {hasSizes && (
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                Tamanho: <span className="text-cyan-400 ml-2">{selectedSize || "Selecione"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {currentVariantStocks.map((s: any) => (
                                    <button
                                        key={s.id}
                                        disabled={s.quantity <= 0}
                                        onClick={() => setSelectedSize(s.size)}
                                        className={`min-w-[65px] h-[55px] flex items-center justify-center rounded-xl border text-xs font-black uppercase transition-all ${
                                            selectedSize === s.size 
                                                ? 'bg-cyan-500 text-black border-cyan-500' 
                                                : s.quantity <= 0 ? 'opacity-20 cursor-not-allowed border-dashed' : 'border-white/10 text-white hover:border-cyan-500'
                                        }`}
                                    >
                                        {s.size}
                                    </button>
                                ))}
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
                        disabled={totalStock === 0}
                        className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${
                            totalStock === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-cyan-500 text-black hover:bg-cyan-400 active:scale-95'
                        }`}
                    >
                        <ShoppingCart size={22} />
                        {totalStock === 0 ? "Esgotado" : "Adicionar à Bag"}
                    </button>

                    {/* INFOS EXTRAS */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <Truck className="text-cyan-400" size={20} />
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-300">Entrega Expressa</p>
                                <p className="text-[9px] text-gray-500">Envio em 24h</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                            <ShieldCheck className="text-cyan-400" size={20} />
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-300">Compra Segura</p>
                                <p className="text-[9px] text-gray-500">Dados protegidos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL DE GUIA DE TAMANHOS */}
            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
                type={guideType}
            />
        </div>
    );
}