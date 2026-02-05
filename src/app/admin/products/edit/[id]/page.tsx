"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Plus, Trash2, Box, Ruler, Layers, FileText, Star } from "lucide-react";
import Link from "next/link";

// --- CONFIGURAÇÃO DE DIMENSÕES ---
const SMART_DIMENSIONS: Record<string, any> = {
    "celular": { weight: 0.4, height: 5, width: 10, length: 18 },
    "tênis": { weight: 1.0, height: 12, width: 20, length: 32 },
    "camiseta": { weight: 0.3, height: 2, width: 20, length: 25 },
    "padrão": { weight: 0.5, height: 10, width: 20, length: 20 }
};

const AVAILABLE_SIZES = [
    "PP", "P", "M", "G", "GG", "XG",
    "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [filteredSubs, setFilteredSubs] = useState<any[]>([]);

    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

    const [baseData, setBaseData] = useState({
        name: "",
        description: "",
        price: "",
        category_id: "",
        subcategory_id: "",
        weight: "",
        height: "",
        width: "",
        length: "",
        is_featured: false // NOVO CAMPO
    });

    const [variants, setVariants] = useState<any[]>([
        { color_name: "Padrão", image_url: "", stockPerSize: {} as Record<string, number>, simpleStock: 0 }
    ]);

    // 1. CARREGAR DADOS
    useEffect(() => {
        async function loadProductData() {
            setLoading(true);

            const { data: cats } = await supabase.from('categories').select('*');
            const { data: subs } = await supabase.from('subcategories').select('*');
            if (cats) setCategories(cats);
            if (subs) setSubcategories(subs);

            const { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !product) {
                alert("Produto não encontrado.");
                router.push("/admin/products");
                return;
            }

            setBaseData({
                name: product.name,
                description: product.description || "",
                price: product.price.toString(),
                category_id: "",
                subcategory_id: product.subcategory_id.toString(),
                weight: product.weight?.toString() || "",
                height: product.height?.toString() || "",
                width: product.width?.toString() || "",
                length: product.length?.toString() || "",
                is_featured: product.is_featured || false // CARREGA O STATUS DESTAQUE
            });

            if (product.sizes && Array.isArray(product.sizes)) {
                setSelectedSizes(product.sizes);
            }

            if (subs) {
                const currentSub = subs.find(s => s.id === product.subcategory_id);
                if (currentSub) {
                    setBaseData(prev => ({ ...prev, category_id: currentSub.category_id.toString() }));
                }
            }

            const { data: dbVariants } = await supabase.from('product_variants').select('*').eq('product_id', id);
            const { data: dbStock } = await supabase.from('product_stock').select('*').eq('product_id', id);

            if (dbVariants) {
                const formattedVariants = dbVariants.map(v => {
                    const stockMap: Record<string, number> = {};
                    if (dbStock) {
                        const myStock = dbStock.filter((s: any) => s.variant_id === v.id);
                        myStock.forEach((s: any) => {
                            stockMap[s.size] = s.quantity;
                        });
                    }
                    return {
                        id: v.id,
                        color_name: v.color_name,
                        image_url: v.image_url || "",
                        simpleStock: v.stock,
                        stockPerSize: stockMap
                    };
                });
                setVariants(formattedVariants);
            }
            setLoading(false);
        }
        loadProductData();
    }, [id]);

    useEffect(() => {
        if (baseData.category_id && subcategories.length > 0) {
            setFilteredSubs(subcategories.filter(s => s.category_id === parseInt(baseData.category_id)));
        }
    }, [baseData.category_id, subcategories]);

    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) setSelectedSizes(selectedSizes.filter(s => s !== size));
        else setSelectedSizes([...selectedSizes, size]);
    };

    const isFashionCategory = () => {
        const cat = categories.find(c => c.id.toString() === baseData.category_id);
        if (!cat) return false;
        const name = cat.name.toLowerCase();
        return ["calçado", "roupa", "moda", "tênis", "sapato"].some(k => name.includes(k));
    };

    const addVariant = () => setVariants([...variants, { color_name: "", image_url: "", stockPerSize: {}, simpleStock: 0 }]);

    const removeVariant = async (index: number) => {
        const variantToRemove = variants[index];
        if (variants.length <= 1) { alert("Mínimo 1 variação."); return; }
        if (variantToRemove.id) {
            if (!confirm("Isso apagará o estoque desta cor. Continuar?")) return;
            const { error } = await supabase.from('product_variants').delete().eq('id', variantToRemove.id);
            if (error) { alert("Erro: " + error.message); return; }
        }
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVars = [...variants];
        newVars[index] = { ...newVars[index], [field]: value };
        setVariants(newVars);
    };

    const updateSizeStock = (variantIndex: number, size: string, qty: string) => {
        const newVars = [...variants];
        newVars[variantIndex].stockPerSize = { ...newVars[variantIndex].stockPerSize, [size]: parseInt(qty) || 0 };
        setVariants(newVars);
    };

    async function handleSave(e: any) {
        e.preventDefault();
        setSaving(true);

        try {
            const isFashion = isFashionCategory();

            // 1. Atualiza Produto Pai
            const { error: prodError } = await supabase
                .from("products")
                .update({
                    name: baseData.name,
                    description: baseData.description,
                    price: parseFloat(baseData.price.replace(',', '.')) || 0,
                    subcategory_id: parseInt(baseData.subcategory_id),
                    image_url: variants[0]?.image_url,
                    weight: parseFloat(baseData.weight),
                    height: parseFloat(baseData.height),
                    width: parseFloat(baseData.width),
                    length: parseFloat(baseData.length),
                    sizes: isFashion ? selectedSizes : null,
                    is_featured: baseData.is_featured // ATUALIZA O DESTAQUE
                })
                .eq('id', id);

            if (prodError) throw prodError;

            // 2. Loop pelas Variações
            for (const variant of variants) {
                let totalStock = variant.simpleStock;
                if (isFashion) {
                    totalStock = Object.values(variant.stockPerSize).reduce((a: any, b: any) => a + b, 0);
                }

                const variantData = {
                    product_id: id,
                    color_name: variant.color_name || "Padrão",
                    stock: totalStock,
                    image_url: variant.image_url
                };

                let savedVariantId = variant.id;

                if (variant.id) {
                    await supabase.from("product_variants").update(variantData).eq('id', variant.id);
                } else {
                    const { data: newVar } = await supabase.from("product_variants").insert(variantData).select().single();
                    if (newVar) savedVariantId = newVar.id;
                }

                // 3. Atualiza Estoque Detalhado
                if (isFashion && savedVariantId) {
                    for (const size of selectedSizes) {
                        const qty = variant.stockPerSize[size] || 0;
                        const { data: existingStock } = await supabase
                            .from('product_stock')
                            .select('id')
                            .eq('variant_id', savedVariantId)
                            .eq('size', size)
                            .single();

                        if (existingStock) {
                            await supabase.from('product_stock').update({ quantity: qty }).eq('id', existingStock.id);
                        } else {
                            await supabase.from('product_stock').insert({
                                product_id: id,
                                variant_id: savedVariantId,
                                size: size,
                                quantity: qty
                            });
                        }
                    }
                }
            }

            alert("Produto atualizado com sucesso!");
            router.push("/admin/products");

        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center text-cyan-400"><Loader2 className="animate-spin mr-2" /> Carregando...</div>;

    return (
        <main className="p-8 pt-24 text-white min-h-screen flex justify-center">
            <div className="w-full max-w-5xl">
                <Link href="/admin/products" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 w-fit">
                    <ArrowLeft size={20} /> Voltar
                </Link>
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <Box className="text-cyan-400" /> Editar Produto
                </h1>

                <form onSubmit={handleSave} className="space-y-8">

                    {/* 1. DETALHES BÁSICOS */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400">1. Informações</h2>

                            {/* CHECKBOX DE DESTAQUE */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={baseData.is_featured}
                                    onChange={e => setBaseData({ ...baseData, is_featured: e.target.checked })}
                                    className="hidden"
                                />
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${baseData.is_featured ? 'bg-purple-600 border-purple-500' : 'bg-black border-gray-600 group-hover:border-gray-400'}`}>
                                    {baseData.is_featured && <Star size={14} className="text-white" fill="currentColor" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Destacar Produto</span>
                                    <span className="text-[10px] text-gray-500">Aparecerá em "Queridinhos" na Home</span>
                                </div>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-400">Categoria</label>
                                <select className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white"
                                    value={baseData.category_id} onChange={e => setBaseData({ ...baseData, category_id: e.target.value })} required>
                                    <option value="">Selecione...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Subcategoria</label>
                                <select className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white"
                                    value={baseData.subcategory_id} onChange={e => setBaseData({ ...baseData, subcategory_id: e.target.value })} required>
                                    <option value="">Selecione...</option>
                                    {filteredSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Nome</label>
                                <input required value={baseData.name} onChange={e => setBaseData({ ...baseData, name: e.target.value })} className="bg-black border border-gray-700 rounded-xl p-3 w-full" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Preço (R$)</label>
                                <input required value={baseData.price} onChange={e => setBaseData({ ...baseData, price: e.target.value })} className="bg-black border border-gray-700 rounded-xl p-3 w-full" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block flex items-center gap-2">
                                <FileText size={16} /> Descrição Detalhada
                            </label>
                            <textarea
                                rows={4}
                                value={baseData.description}
                                onChange={e => setBaseData({ ...baseData, description: e.target.value })}
                                className="w-full bg-black border border-gray-700 rounded-xl p-3 outline-none focus:border-cyan-500 text-white placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* 2. GRADE DE TAMANHOS */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Ruler size={20} /> 2. Grade de Tamanhos</h2>
                            {isFashionCategory() && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded font-bold">* Obrigatório</span>}
                        </div>
                        <p className="text-sm text-gray-400">Edite os tamanhos disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SIZES.map((size) => (
                                <button key={size} type="button" onClick={() => toggleSize(size)}
                                    className={`w-10 h-10 rounded-lg font-bold text-xs transition-all border ${selectedSizes.includes(size) ? "bg-cyan-600 border-cyan-500 text-white" : "bg-black border-gray-700 text-gray-500 hover:border-gray-500"}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. ESTOQUE DETALHADO */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Layers size={20} /> 3. Estoque por Cor</h2>
                            <button type="button" onClick={addVariant} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2"><Plus size={14} /> Nova Cor</button>
                        </div>

                        {variants.map((variant, idx) => (
                            <div key={idx} className="bg-black/40 p-6 rounded-xl border border-gray-800 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Cor</label>
                                        <input required value={variant.color_name} onChange={e => updateVariant(idx, 'color_name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">URL Imagem</label>
                                        <input value={variant.image_url} onChange={e => updateVariant(idx, 'image_url', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500" />
                                    </div>
                                </div>

                                {isFashionCategory() && selectedSizes.length > 0 ? (
                                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/50">
                                        <p className="text-xs text-gray-400 mb-3 font-bold uppercase">Estoque por Tamanho:</p>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {selectedSizes.map(size => (
                                                <div key={size} className="text-center">
                                                    <label className="block text-[10px] text-gray-500 mb-1">Tam {size}</label>
                                                    <input
                                                        type="number" min="0" placeholder="0"
                                                        value={variant.stockPerSize[size] || 0}
                                                        onChange={(e) => updateSizeStock(idx, size, e.target.value)}
                                                        className="w-full bg-black border border-gray-700 rounded p-1.5 text-center text-sm focus:border-cyan-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Qtd Estoque</label>
                                        <input type="number" value={variant.simpleStock} onChange={e => updateVariant(idx, 'simpleStock', e.target.value)} className="w-32 bg-gray-900 border border-gray-700 rounded-lg p-2 text-center" />
                                    </div>
                                )}

                                {variants.length > 1 && (
                                    <button type="button" onClick={() => removeVariant(idx)} className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 mt-2">
                                        <Trash2 size={12} /> Remover Variante
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 4. DIMENSÕES */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-6">
                        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Box size={20} /> 4. Dimensões (Frete)</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div><label className="text-xs text-gray-500 font-bold">Peso</label><input value={baseData.weight} onChange={e => setBaseData({ ...baseData, weight: e.target.value })} className="w-full bg-black border-gray-700 rounded-xl p-3 text-center" /></div>
                            <div><label className="text-xs text-gray-500 font-bold">Altura</label><input value={baseData.height} onChange={e => setBaseData({ ...baseData, height: e.target.value })} className="w-full bg-black border-gray-700 rounded-xl p-3 text-center" /></div>
                            <div><label className="text-xs text-gray-500 font-bold">Largura</label><input value={baseData.width} onChange={e => setBaseData({ ...baseData, width: e.target.value })} className="w-full bg-black border-gray-700 rounded-xl p-3 text-center" /></div>
                            <div><label className="text-xs text-gray-500 font-bold">Comprim.</label><input value={baseData.length} onChange={e => setBaseData({ ...baseData, length: e.target.value })} className="w-full bg-black border-gray-700 rounded-xl p-3 text-center" /></div>
                        </div>
                    </div>

                    <button disabled={saving} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg">
                        {saving ? "Atualizando..." : "Salvar Alterações"}
                    </button>
                </form>
            </div>
        </main>
    );
}