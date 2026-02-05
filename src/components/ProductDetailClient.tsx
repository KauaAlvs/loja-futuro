"use client";

import { useState } from "react";
import { useCartStore } from "../app/store/cartStore";
import {
    ShoppingCart, Truck, ShieldCheck, Ruler,
    AlertCircle, Check, X, Star, Package
} from "lucide-react";
import { SizeGuideModal } from "@/components/SizeGuideModal";

// Interface atualizada para aceitar o totalStock
interface ProductDetailClientProps {
    product: any;
    variants: any[];
    totalStock: number;
}

export function ProductDetailClient({ product, variants, totalStock }: ProductDetailClientProps) {
    // 1. Estados
    const { addToCart, toggleCart } = useCartStore();

    // Seleciona a primeira variante automaticamente se houver estoque
    const [selectedVariant, setSelectedVariant] = useState<any>(
        variants.find(v => v.stock > 0) || variants[0] || null
    );

    // Se o produto tiver array de tamanhos soltos (json), usa isso. Se não, usa o tamanho da variante.
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // 2. Lógica de Tamanhos e Categoria
    // Verifica se os tamanhos vêm das variantes ou de um campo 'sizes' no produto
    const variantsHaveSizes = variants.some(v => v.size);
    const hasSizes = variantsHaveSizes || (product.sizes && product.sizes.length > 0);

    const categoryName = (product.subcategories?.categories?.name || "").toLowerCase();
    const subcategoryName = (product.subcategories?.name || "").toLowerCase();

    // Detecção de Tipo (Calçado vs Roupa)
    const footwearKeywords = ["calçado", "tênis", "sapato", "bota", "salto", "chuteira", "sandália", "chinelo"];
    const isFootwear = footwearKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));
    const guideType = isFootwear ? "footwear" : "clothing";

    // Mostra guia se for moda
    const fashionKeywords = [...footwearKeywords, "roupa", "moda", "camiseta", "calça", "jaqueta", "moletom", "bermuda"];
    const showSizeGuide = fashionKeywords.some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));

    // 3. Notificações
    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // 4. Adicionar ao Carrinho
    const handleAddToCart = () => {
        // Validação de Estoque Geral
        if (totalStock <= 0) {
            showMessage("Produto esgotado!", "error");
            return;
        }

        // Validação de Variante Específica
        if (selectedVariant && selectedVariant.stock <= 0) {
            showMessage("Esta variação está esgotada.", "error");
            return;
        }

        // Se o sistema usa tamanhos separados das variantes
        if (!variantsHaveSizes && hasSizes && !selectedSize) {
            showMessage("Selecione um tamanho.", "error");
            return;
        }

        addToCart({
            id: selectedVariant?.id || product.id,
            name: product.name,
            price: product.price,
            image_url: selectedVariant?.image_url || product.image_url,
            quantity: 1,
            variant_id: selectedVariant?.id,
            color: selectedVariant?.color_name,
            size: selectedVariant?.size || selectedSize // Usa o tamanho da variante ou o selecionado
        });

        showMessage("Adicionado ao carrinho!");
        toggleCart();
    };

    const currentImage = selectedVariant?.image_url || product.image_url;
    const isProductSoldOut = totalStock === 0;

    return (
        <div className="relative">
            {/* TOAST NOTIFICATION */}
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

                {/* --- COLUNA ESQUERDA: IMAGEM --- */}
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

                        {/* Badge de Esgotado Gigante */}
                        {isProductSoldOut && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-black uppercase text-red-500 tracking-widest border-4 border-red-500 px-8 py-4 -rotate-12 rounded-xl bg-black/50 backdrop-blur">
                                    Esgotado
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Galeria de Variantes (Miniaturas) */}
                    {variants.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                            {variants.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedVariant?.id === v.id
                                        ? 'border-cyan-400 scale-105 opacity-100'
                                        : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white'
                                        }`}
                                >
                                    {v.image_url ? (
                                        <img src={v.image_url} alt={v.color_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- COLUNA DIREITA: INFOS --- */}
                <div className="flex flex-col justify-center">
                    {/* Estrelas */}
                    <div className="flex items-center gap-1 text-cyan-400 mb-4">
                        <Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" />
                        <span className="text-xs text-gray-500 ml-2 font-bold">(4.9/5 de 120 reviews)</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-none text-white">
                        {product.name}
                    </h1>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 inline-block w-full md:w-auto">
                        <span className="text-4xl font-black text-cyan-400 tracking-tight">R$ {product.price.toFixed(2)}</span>
                        {product.old_price && (
                            <span className="text-gray-500 line-through text-lg ml-4 font-bold">R$ {product.old_price.toFixed(2)}</span>
                        )}
                    </div>

                    {/* Seletor de Cores/Variantes */}
                    {variants.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">
                                Variação: <span className="text-white ml-2">{selectedVariant?.color_name || selectedVariant?.size || "Única"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {variants.map((v) => {
                                    const isOutOfStock = v.stock <= 0;
                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => !isOutOfStock && setSelectedVariant(v)}
                                            disabled={isOutOfStock}
                                            className={`
                                                px-6 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest transition-all
                                                ${selectedVariant?.id === v.id
                                                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                                    : isOutOfStock
                                                        ? 'opacity-30 cursor-not-allowed line-through bg-red-900/10'
                                                        : 'hover:bg-white/10 hover:border-white/30 text-gray-300'
                                                }
                                            `}
                                        >
                                            {v.color_name || v.size || "Opção"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Guia de Medidas */}
                    {showSizeGuide && (
                        <div className="mb-4">
                            <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black text-gray-400 hover:text-cyan-400 flex items-center gap-2 uppercase tracking-widest transition-colors">
                                <Ruler size={16} /> Ver Guia de Medidas
                            </button>
                        </div>
                    )}

                    {/* Botão de Compra */}
                    <button
                        onClick={handleAddToCart}
                        disabled={isProductSoldOut}
                        className={`
                            w-full py-6 rounded-[1.5rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl
                            ${isProductSoldOut
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.02] active:scale-95'
                            }
                        `}
                    >
                        <ShoppingCart size={22} />
                        {isProductSoldOut ? "Indisponível" : "Adicionar à Bag"}
                    </button>

                    {/* Infos Extras */}
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

            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
                type={guideType}
            />
        </div>
    );
}