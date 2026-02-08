"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "../app/store/cartStore";
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

    // 1. Estados
    // Seleciona a primeira variante de cor
    const [selectedVariant, setSelectedVariant] = useState<any>(variants[0] || null);
    // Seleciona o tamanho dentro da variante
    const [selectedSize, setSelectedSize] = useState<string>("");
    
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // 2. Lógica de Filtro de Tamanhos
    // Pegamos os tamanhos disponíveis APENAS para a variante (cor) selecionada
    const availableStocks = selectedVariant?.product_stock || [];

    // Resetar o tamanho selecionado se trocar a cor (opcional, mas recomendado)
    useEffect(() => {
        setSelectedSize("");
    }, [selectedVariant]);

    // 3. Detecção de Tipo e Guia
    const categoryName = (product.subcategories?.categories?.name || "").toLowerCase();
    const subcategoryName = (product.subcategories?.name || "").toLowerCase();
    const footwearKeywords = ["calçado", "tênis", "sapato", "bota", "salto", "chuteira", "sandália", "chinelo"];
    const isFootwear = footwearKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));
    const guideType = isFootwear ? "footwear" : "clothing";
    const fashionKeywords = [...footwearKeywords, "roupa", "moda", "camiseta", "calça", "jaqueta", "moletom", "bermuda"];
    const showSizeGuide = fashionKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // 4. Adicionar ao Carrinho
    const handleAddToCart = () => {
        if (totalStock <= 0) {
            showMessage("Produto esgotado!", "error");
            return;
        }

        if (!selectedSize && availableStocks.length > 0) {
            showMessage("Por favor, selecione um tamanho.", "error");
            return;
        }

        // Busca o objeto de estoque específico para pegar o ID correto do estoque se necessário
        const stockInfo = availableStocks.find((s: any) => s.size === selectedSize);

        addToCart({
            id: stockInfo?.id || selectedVariant?.id || product.id,
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
    };

    const currentImage = selectedVariant?.image_url || product.image_url;
    const isProductSoldOut = totalStock === 0;

    return (
        <div className="relative">
            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${toast.type === 'success'
                    ? 'bg-[#0a0a0a] border-cyan-500/50 text-cyan-400'
                    : 'bg-[#0a0a0a] border-red-500/50 text-red-400'
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
                        {currentImage ? (
                            <img
                                src={currentImage}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${isProductSoldOut ? 'grayscale opacity-40' : ''}`}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-800"><Package size={64} /></div>
                        )}

                        {isProductSoldOut && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-black uppercase text-red-500 tracking-widest border-4 border-red-500 px-8 py-4 -rotate-12 rounded-xl bg-black/50 backdrop-blur">
                                    Esgotado
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUNA DIREITA: INFOS */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-cyan-400 mb-4">
                        <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                        <span className="text-xs text-gray-500 ml-2 font-bold">(4.9/5 de 120 reviews)</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-none text-white">
                        {product.name}
                    </h1>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 inline-block w-full md:w-auto">
                        <span className="text-4xl font-black text-cyan-400 tracking-tight">R$ {product.price.toFixed(2)}</span>
                    </div>

                    {/* SELETOR DE CORES */}
                    {variants.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                                Cor: <span className="text-white ml-2">{selectedVariant?.color_name || "Selecione"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`px-6 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest transition-all
                                            ${selectedVariant?.id === v.id
                                                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                                : 'hover:bg-white/10 hover:border-white/30 text-gray-300'}`}
                                    >
                                        {v.color_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SELETOR DE TAMANHOS (CORRIGIDO) */}
                    {availableStocks.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                                Tamanho: <span className="text-cyan-400 ml-2">{selectedSize || "Selecione"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {availableStocks.map((stock: any) => {
                                    const isOutOfStock = stock.quantity <= 0;
                                    return (
                                        <button
                                            key={stock.id}
                                            onClick={() => !isOutOfStock && setSelectedSize(stock.size)}
                                            disabled={isOutOfStock}
                                            className={`
                                                min-w-[60px] h-[50px] flex items-center justify-center rounded-xl border text-xs font-black uppercase transition-all
                                                ${selectedSize === stock.size
                                                    ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                                                    : isOutOfStock
                                                        ? 'opacity-20 cursor-not-allowed border-white/5 bg-white/5'
                                                        : 'border-white/10 text-white hover:border-cyan-500/50'
                                                }
                                            `}
                                        >
                                            {stock.size}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {showSizeGuide && (
                        <div className="mb-6">
                            <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black text-gray-400 hover:text-cyan-400 flex items-center gap-2 uppercase tracking-widest transition-colors">
                                <Ruler size={16} /> Guia de Tamanhos
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleAddToCart}
                        disabled={isProductSoldOut}
                        className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl
                            ${isProductSoldOut
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-95'
                            }`}
                    >
                        <ShoppingCart size={22} />
                        {isProductSoldOut ? "Indisponível" : "Adicionar à Bag"}
                    </button>
                </div>
            </div>

            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
                type={guideType}
            />
        </div>
    );
}