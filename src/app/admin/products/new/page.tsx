"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Ruler, Layers, FileText, Star } from "lucide-react";
import Link from "next/link";

// --- CONFIGURAÇÃO DE DIMENSÕES (Frete) ---
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

export default function NewProductPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [filteredSubs, setFilteredSubs] = useState<any[]>([]);

    // Tamanhos que o produto TERÁ (Global)
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

    // VARIAÇÕES
    const [variants, setVariants] = useState([
        { color_name: "Padrão", image_url: "", stockPerSize: {} as Record<string, number>, simpleStock: 10 }
    ]);

    // Carregar dados iniciais
    useEffect(() => {
        async function loadData() {
            const { data: cats } = await supabase.from('categories').select('*');
            const { data: subs } = await supabase.from('subcategories').select('*');
            if (cats) setCategories(cats);
            if (subs) setSubcategories(subs);
        }
        loadData();
    }, []);

    // Filtrar Subcategorias
    useEffect(() => {
        if (baseData.category_id) {
            setFilteredSubs(subcategories.filter(s => s.category_id === parseInt(baseData.category_id)));
        } else {
            setFilteredSubs([]);
        }
    }, [baseData.category_id, subcategories]);

    // Auto-preenchimento de dimensões
    useEffect(() => {
        if (!baseData.subcategory_id) return;
        const selectedSub = subcategories.find(s => s.id.toString() === baseData.subcategory_id);
        if (!selectedSub) return;

        const name = selectedSub.name.toLowerCase();
        let preset = SMART_DIMENSIONS["padrão"];
        for (const key in SMART_DIMENSIONS) {
            if (name.includes(key)) { preset = SMART_DIMENSIONS[key]; break; }
        }
        setBaseData(prev => ({ ...prev, weight: preset.weight.toString(), height: preset.height.toString(), width: preset.width.toString(), length: preset.length.toString() }));
    }, [baseData.subcategory_id, subcategories]);

    // Toggle de Tamanhos
    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            setSelectedSizes(selectedSizes.filter(s => s !== size));
        } else {
            setSelectedSizes([...selectedSizes, size]);
        }
    };

    const isFashionCategory = () => {
        const cat = categories.find(c => c.id.toString() === baseData.category_id);
        if (!cat) return false;
        const name = cat.name.toLowerCase();
        return ["calçado", "roupa", "moda", "tênis", "sapato"].some(k => name.includes(k));
    };

    // Gerenciamento de Variações
    const addVariant = () => setVariants([...variants, { color_name: "", image_url: "", stockPerSize: {}, simpleStock: 0 }]);
    const removeVariant = (index: number) => {
        if (variants.length > 1) setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVars = [...variants];
        // @ts-ignore
        newVars[index][field] = value;
        setVariants(newVars);
    };

    const updateSizeStock = (variantIndex: number, size: string, qty: string) => {
        const newVars = [...variants];
        newVars[variantIndex].stockPerSize = {
            ...newVars[variantIndex].stockPerSize,
            [size]: parseInt(qty) || 0
        };
        setVariants(newVars);
    };

    async function handleSave(e: any) {
        e.preventDefault();
        setSaving(true);

        try {
            const isFashion = isFashionCategory();

            // Validação
            if (isFashion && selectedSizes.length === 0) {
                alert("Para produtos de moda, selecione pelo menos um tamanho.");
                setSaving(false); return;
            }

            // 1. Cria Produto Pai
            const { data: product, error: prodError } = await supabase
                .from("products")
                .insert([{
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
                    is_featured: baseData.is_featured // SALVA O DESTAQUE
                }])
                .select()
                .single();

            if (prodError) throw prodError;

            // 2. Loop pelas Variações
            for (const variant of variants) {
                let totalStock = variant.simpleStock;
                if (isFashion) {
                    totalStock = Object.values(variant.stockPerSize).reduce((a, b) => a + b, 0);
                }

                const { data: savedVariant, error: varError } = await supabase
                    .from("product_variants")
                    .insert({
                        product_id: product.id,
                        color_name: variant.color_name || "Padrão",
                        stock: totalStock,
                        image_url: variant.image_url
                    })
                    .select()
                    .single();

                if (varError) throw varError;

                // 3. SE FOR MODA: Salva o estoque detalhado
                if (isFashion) {
                    const stockEntries = selectedSizes.map(size => ({
                        product_id: product.id,
                        variant_id: savedVariant.id,
                        size: size,
                        quantity: variant.stockPerSize[size] || 0
                    }));

                    const { error: stockError } = await supabase
                        .from("product_stock")
                        .insert(stockEntries);

                    if (stockError) throw stockError;
                }
            }

            alert("Produto criado com sucesso!");
            router.push("/admin/products");

        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="p-8 pt-24 text-white min-h-screen flex justify-center">
            <div className="w-full max-w-5xl">
                <Link href="/admin/products" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 w-fit">
                    <ArrowLeft size={20} /> Cancelar
                </Link>
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <Plus className="text-cyan-400" /> Novo Produto
                </h1>

                <form onSubmit={handleSave} className="space-y-8">

                    {/* INFO BÁSICA */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400">1. Detalhes Básicos</h2>

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
                                <label className="text-sm text-gray-400 mb-1 block">Nome do Produto</label>
                                <input required value={baseData.name} onChange={e => setBaseData({ ...baseData, name: e.target.value })} className="bg-black border border-gray-700 rounded-xl p-3 w-full outline-none focus:border-cyan-500" placeholder="Ex: Tênis Runner Pro" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Preço (R$)</label>
                                <input required value={baseData.price} onChange={e => setBaseData({ ...baseData, price: e.target.value })} className="bg-black border border-gray-700 rounded-xl p-3 w-full outline-none focus:border-cyan-500" placeholder="0,00" />
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
                                placeholder="Descreva os detalhes, material e diferenciais do produto..."
                            />
                        </div>
                    </div>

                    {/* SELEÇÃO DE TAMANHOS GLOBAIS */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Ruler size={20} /> 2. Grade de Tamanhos</h2>
                            {isFashionCategory() && <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded font-bold">* Obrigatório</span>}
                        </div>
                        <p className="text-sm text-gray-400">Selecione quais tamanhos este modelo possui:</p>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_SIZES.map((size) => (
                                <button key={size} type="button" onClick={() => toggleSize(size)}
                                    className={`w-10 h-10 rounded-lg font-bold text-xs transition-all border ${selectedSizes.includes(size) ? "bg-cyan-600 border-cyan-500 text-white" : "bg-black border-gray-700 text-gray-500 hover:border-gray-500"}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ESTOQUE DETALHADO */}
                    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><Layers size={20} /> 3. Estoque por Cor e Tamanho</h2>
                            <button type="button" onClick={addVariant} className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg flex items-center gap-2"><Plus size={14} /> Nova Cor</button>
                        </div>

                        {variants.map((variant, idx) => (
                            <div key={idx} className="bg-black/40 p-6 rounded-xl border border-gray-800 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Nome da Cor</label>
                                        <input required value={variant.color_name} onChange={e => updateVariant(idx, 'color_name', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500 outline-none" placeholder="Ex: Vermelho" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">URL da Imagem</label>
                                        <input value={variant.image_url} onChange={e => updateVariant(idx, 'image_url', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-cyan-500 outline-none" placeholder="https://..." />
                                    </div>
                                </div>

                                {isFashionCategory() && selectedSizes.length > 0 ? (
                                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700/50">
                                        <p className="text-xs text-gray-400 mb-3 font-bold uppercase">Defina o estoque para cada tamanho:</p>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                            {selectedSizes.map(size => (
                                                <div key={size} className="text-center">
                                                    <label className="block text-[10px] text-gray-500 mb-1">Tam {size}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={variant.stockPerSize[size] || ""}
                                                        onChange={(e) => updateSizeStock(idx, size, e.target.value)}
                                                        className="w-full bg-black border border-gray-700 rounded p-1.5 text-center text-sm focus:border-cyan-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Quantidade em Estoque</label>
                                        <input type="number" value={variant.simpleStock} onChange={e => updateVariant(idx, 'simpleStock', e.target.value)} className="w-32 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-center" />
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

                    <button disabled={saving} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
                        {saving ? "Salvando..." : "Finalizar Cadastro"}
                    </button>
                </form>
            </div>
        </main>
    );
}