"use client";

import { useState, useEffect, useMemo } from "react";
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

    // --- ESTADOS ---
    // Seleciona a primeira variante que possui algum estoque disponível em qualquer tamanho
    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        return variants.find(v => 
            v.product_stock?.some((s: any) => s.quantity > 0)
        ) || variants[0] || null;
    });

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // --- LÓGICA DE DERIVAÇÃO DE DADOS ---
    // Obtém a lista de tamanhos/estoque da variante de cor selecionada no momento
    const currentVariantStocks = useMemo(() => {
        return selectedVariant?.product_stock || [];
    }, [selectedVariant]);

    // Calcula se a variante selecionada especificamente tem estoque total (soma de todos os tamanhos dela)
    const isCurrentVariantInStock = currentVariantStocks.reduce((acc: number, s: any) => acc + (s.quantity || 0), 0) > 0;

    // --- EFEITOS ---
    // Resetar o tamanho selecionado sempre que o usuário trocar a Cor (Variante)
    useEffect(() => {
        setSelectedSize("");
    }, [selectedVariant]);

    // --- AUXILIARES DE INTERFACE ---
    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const categoryName = (product.subcategories?.categories?.name || "").toLowerCase();
    const subcategoryName = (product.subcategories?.name || "").toLowerCase();

    // Detecção para o Guia de Medidas
    const footwearKeywords = ["calçado", "tênis", "sapato", "bota", "salto", "chuteira", "sandália", "chinelo"];
    const isFootwear = footwearKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));
    const guideType = isFootwear ? "footwear" : "clothing";

    const fashionKeywords = [...footwearKeywords, "roupa", "moda", "camiseta", "calça", "jaqueta", "moletom", "bermuda"];
    const showSizeGuide = fashionKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));

    // --- AÇÃO DE CARRINHO ---
    const handleAddToCart = () => {
        if (totalStock <= 0) {
            showMessage("Este produto está totalmente esgotado.", "error");
            return;
        }

        if (!selectedSize) {
            showMessage("Selecione um tamanho antes de continuar.", "error");
            return;
        }

        const targetStock = currentVariantStocks.find((s: any) => s.size === selectedSize);

        if (!targetStock || targetStock.quantity <= 0) {
            showMessage("Este tamanho acabou de esgotar nesta cor.", "error");
            return;
        }

        addToCart({
            id: targetStock.id, // ID Único do Estoque (combinação exata de Cor + Tamanho)
            name: product.name,
            price: product.price,
            image_url: selectedVariant?.image_url || product.image_url,
            quantity: 1,
            variant_id: selectedVariant?.id,
            color: selectedVariant?.color_name,
            size: selectedSize
        });

        showMessage("Adicionado ao carrinho com sucesso!");
        toggleCart();
    };

    const currentImage = selectedVariant?.image_url || product.image_url;

    return (
        <div className="relative">
            {/* NOTIFICAÇÃO (TOAST) */}
            {toast && (
                <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
                    toast.type === 'success' ? 'bg-[#0a0a0a] border-cyan-500/50 text-cyan-400' : 'bg-[#0a0a0a] border-red-500/50 text-red-400'
                }`}>
                    {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                    <span className="font-bold text-xs uppercase tracking-widest">{toast.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                
                {/* --- SEÇÃO DE IMAGEM --- */}
                <div className="space-y-6">
                    <div className="aspect-square relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl group">
                        <img
                            src={currentImage}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 ${totalStock === 0 ? 'grayscale opacity-40' : ''}`}
                        />
                        {totalStock === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-black uppercase text-red-500 tracking-widest border-4 border-red-500 px-8 py-4 -rotate-12 rounded-xl bg-black/50 backdrop-blur">
                                    Esgotado
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Galeria de Miniaturas (Cores) */}
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

                {/* --- SEÇÃO DE INFORMAÇÕES E COMPRA --- */}
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-cyan-400 mb-4">
                        <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                        <span className="text-[10px] text-gray-500 ml-2 font-bold uppercase tracking-tighter">Produto Premium Selecionado</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-none text-white">
                        {product.name}
                    </h1>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 inline-block w-full">
                        <span className="text-4xl font-black text-cyan-400 tracking-tight">R$ {product.price.toFixed(2)}</span>
                    </div>

                    {/* SELETOR DE CORES */}
                    <div className="mb-8">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                            Selecione a Cor: <span className="text-white ml-2">{selectedVariant?.color_name || "Única"}</span>
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                        selectedVariant?.id === v.id ? 'bg-white text-black border-white' : 'border-white/10 text-gray-400 hover:border-white/30'
                                    }`}
                                >
                                    {v.color_name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SELETOR DE TAMANHOS (DINÂMICO POR COR) */}
                    {currentVariantStocks.length > 0 && (
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                                Tamanho Disponível: <span className="text-cyan-400 ml-2">{selectedSize || "Aguardando Seleção"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {currentVariantStocks.map((stock: any) => {
                                    const isOutOfStock = stock.quantity <= 0;
                                    return (
                                        <button
                                            key={stock.id}
                                            disabled={isOutOfStock}
                                            onClick={() => setSelectedSize(stock.size)}
                                            className={`min-w-[65px] h-[55px] flex items-center justify-center rounded-xl border text-xs font-black uppercase transition-all ${
                                                selectedSize === stock.size 
                                                    ? 'bg-cyan-500 text-black border-cyan-500' 
                                                    : isOutOfStock 
                                                        ? 'opacity-20 cursor-not-allowed border-dashed border-white/10' 
                                                        : 'border-white/10 text-white hover:border-cyan-500/50'
                                            }`}
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
                            <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black text-gray-400 hover:text-cyan-400 flex items-center gap-2 uppercase tracking-[0.2em] transition-colors">
                                <Ruler size={16} /> Ver tabela de medidas
                            </button>
                        </div>
                    )}

                    {/* BOTÃO FINAL */}
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