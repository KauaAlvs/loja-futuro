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

    // 1. Inicialização Inteligente da Variante
    const [selectedVariant, setSelectedVariant] = useState<any>(() => {
        // Procura a primeira variante que tenha estoque (seja por tamanho ou direto)
        return variants.find(v => {
            const qtySizes = v.product_stock?.reduce((acc:number, s:any) => acc + (Number(s.quantity)||0), 0) || 0;
            const qtyGeneral = Number(v.stock) || 0;
            return qtySizes > 0 || qtyGeneral > 0;
        }) || variants[0] || null;
    });

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // 2. Determina se a variante atual PRECISA de tamanho
    const currentVariantStocks = useMemo(() => selectedVariant?.product_stock || [], [selectedVariant]);
    const hasSizes = currentVariantStocks.length > 0;

    // 3. EFEITO: Auto-selecionar tamanho se houver apenas 1 (ex: Único)
    useEffect(() => {
        if (hasSizes) {
            if (currentVariantStocks.length === 1 && (Number(currentVariantStocks[0].quantity) > 0)) {
                // Se só tem 1 tamanho (ex: Único) e tem estoque, seleciona sozinho
                setSelectedSize(currentVariantStocks[0].size);
            } else {
                // Se tem vários, limpa a seleção
                setSelectedSize("");
            }
        } else {
            // Se não tem tamanhos (Boné), limpa
            setSelectedSize("");
        }
    }, [selectedVariant, hasSizes, currentVariantStocks]);

    // 4. Auxiliares de UI
    const categoryName = (product.subcategories?.categories?.name || "").toLowerCase();
    const subcategoryName = (product.subcategories?.name || "").toLowerCase();
    const isFootwear = ["calçado", "tênis", "sapato"].some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));
    const showSizeGuide = ["roupa", "moda", "camiseta", "calça", "tênis"].some(tag => categoryName.includes(tag) || subcategoryName.includes(tag));

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAddToCart = () => {
        if (totalStock <= 0) {
            showMessage("Produto esgotado!", "error");
            return;
        }

        // LÓGICA CRÍTICA CORRIGIDA:
        // Só exige tamanho SE a variante tiver registros na tabela de tamanhos (hasSizes = true)
        if (hasSizes && !selectedSize) {
            showMessage("Por favor, selecione um tamanho.", "error");
            return;
        }

        let cartItemId = selectedVariant?.id;
        let finalSize = null;

        if (hasSizes) {
            // Fluxo com Tamanho (Roupas)
            const sizeObj = currentVariantStocks.find((s: any) => s.size === selectedSize);
            if (!sizeObj || (Number(sizeObj.quantity) <= 0)) {
                showMessage("Tamanho indisponível.", "error");
                return;
            }
            cartItemId = sizeObj.id; // ID do product_stock
            finalSize = selectedSize;
        } else {
            // Fluxo sem Tamanho (Acessórios/Bonés)
            const variantQty = Number(selectedVariant?.stock) || 0;
            if (variantQty <= 0) {
                showMessage("Opção esgotada.", "error");
                return;
            }
            cartItemId = selectedVariant?.id; // ID do product_variants
            finalSize = null;
        }

        addToCart({
            id: cartItemId,
            name: product.name,
            price: product.price,
            image_url: selectedVariant?.image_url || product.image_url,
            quantity: 1,
            variant_id: selectedVariant?.id,
            color: selectedVariant?.color_name,
            size: finalSize
        });

        showMessage("Adicionado ao carrinho!");
        toggleCart();
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

                {/* INFOS */}
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
                                    // Verifica se a variante tem estoque (seja em tamanhos ou geral)
                                    const vStockSizes = v.product_stock?.reduce((a:number, s:any) => a + (Number(s.quantity)||0), 0) || 0;
                                    const vStockGeneral = Number(v.stock) || 0;
                                    const hasStock = vStockSizes > 0 || vStockGeneral > 0;

                                    return (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                                                selectedVariant?.id === v.id 
                                                ? 'bg-white text-black border-white shadow-xl' 
                                                : !hasStock 
                                                    ? 'opacity-30 border-dashed border-white/10' 
                                                    : 'border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            {v.color_name || "Única"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* SELETOR DE TAMANHOS (SÓ APARECE SE TIVER TAMANHOS) */}
                    {hasSizes && (
                        <div className="mb-10">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                                Tamanho: <span className="text-cyan-400 ml-2">{selectedSize || "Selecione"}</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {currentVariantStocks.map((s: any) => {
                                    const qty = Number(s.quantity) || 0;
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
                </div>
            </div>

            <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} type={isFootwear ? "footwear" : "clothing"} />
        </div>
    );
}