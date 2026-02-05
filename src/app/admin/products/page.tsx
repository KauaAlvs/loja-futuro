"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Trash2, Plus, Edit, Filter, ChevronDown, X, Search, Calendar } from "lucide-react";
import Link from "next/link";

export default function ProductsListPage() {
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    const [searchName, setSearchName] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterStockMax, setFilterStockMax] = useState("");

    const [showPriceFilter, setShowPriceFilter] = useState(false);
    const [priceMin, setPriceMin] = useState("");
    const [priceMax, setPriceMax] = useState("");

    const priceFilterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchInitialData();

        function handleClickOutside(event: any) {
            if (priceFilterRef.current && !priceFilterRef.current.contains(event.target)) {
                setShowPriceFilter(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchName, filterCategory, filterStockMax, priceMin, priceMax, allProducts]);

    async function fetchInitialData() {
        setLoading(true);
        const { data: cats } = await supabase.from('categories').select('*');
        if (cats) setCategories(cats);

        const { data: products, error } = await supabase
            .from("products")
            .select(`
                *,
                subcategories (
                    id,
                    name,
                    category_id,
                    categories (name)
                ),
                product_variants (*)
            `)
            .eq('archived', false)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro:", error);
        } else {
            setAllProducts(products || []);
            setFilteredProducts(products || []);
        }
        setLoading(false);
    }

    function applyFilters() {
        let result = [...allProducts];

        if (searchName) {
            result = result.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()));
        }

        if (filterCategory) {
            result = result.filter(p => p.subcategories?.category_id === Number(filterCategory));
        }

        if (filterStockMax) {
            const max = Number(filterStockMax);
            result = result.filter(p => getTotalStock(p.product_variants) <= max);
        }

        if (priceMin) {
            result = result.filter(p => Number(p.price) >= Number(priceMin));
        }
        if (priceMax) {
            result = result.filter(p => Number(p.price) <= Number(priceMax));
        }

        setFilteredProducts(result);
    }

    const getTotalStock = (variants: any[]) => {
        return variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
    };

    const getCategoryName = (p: any) => {
        return p.subcategories?.categories?.name || "Sem Categoria";
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    async function handleDelete(id: number) {
        if (!confirm("Tem certeza? O produto será arquivado.")) return;
        const { error } = await supabase.from("products").update({ archived: true }).eq("id", id);
        if (!error) {
            setAllProducts(allProducts.filter((p) => p.id !== id));
            alert("Produto arquivado.");
        } else {
            alert("Erro: " + error.message);
        }
    }

    return (
        <main className="p-4 md:p-8 pt-24 text-white min-h-screen">
            <div className="container mx-auto max-w-7xl">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                            Gestão de Produtos
                        </h1>
                        <p className="text-gray-400 text-sm">Gerencie catálogo, preços e estoque.</p>
                    </div>

                    <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/20 w-full md:w-auto justify-center"
                    >
                        <Plus size={20} /> Novo Produto
                    </Link>
                </div>

                {/* BARRA DE FILTROS */}
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center bg-black border border-gray-700 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
                        <Search size={18} className="text-gray-500 mr-2" />
                        <input
                            placeholder="Buscar por nome..."
                            value={searchName}
                            onChange={e => setSearchName(e.target.value)}
                            className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-600"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 text-gray-300 min-w-[150px]"
                    >
                        <option value="">Todas as Categorias</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-bold uppercase">Estoque &le;</span>
                        <input
                            type="number"
                            placeholder="Qtd Máx"
                            value={filterStockMax}
                            onChange={e => setFilterStockMax(e.target.value)}
                            className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 w-24 text-center"
                        />
                    </div>

                    <div className="relative" ref={priceFilterRef}>
                        <button
                            onClick={() => setShowPriceFilter(!showPriceFilter)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${(priceMin || priceMax) ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-black border-gray-700 text-gray-300 hover:bg-gray-800'}`}
                        >
                            <Filter size={16} /> Preço <ChevronDown size={14} />
                        </button>

                        {showPriceFilter && (
                            <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl z-50 w-64 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Faixa de Preço</h4>
                                <div className="flex items-center gap-2 mb-3">
                                    <input
                                        type="number" placeholder="Min"
                                        value={priceMin} onChange={e => setPriceMin(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:border-cyan-500 outline-none"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number" placeholder="Max"
                                        value={priceMax} onChange={e => setPriceMax(e.target.value)}
                                        className="w-full bg-black border border-gray-700 rounded p-2 text-sm focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <button onClick={() => setShowPriceFilter(false)} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded transition-colors">
                                    Aplicar Filtro
                                </button>
                            </div>
                        )}
                    </div>

                    {(searchName || filterCategory || filterStockMax || priceMin || priceMax) && (
                        <button
                            onClick={() => {
                                setSearchName("");
                                setFilterCategory("");
                                setFilterStockMax("");
                                setPriceMin("");
                                setPriceMax("");
                            }}
                            className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 ml-auto md:ml-0"
                        >
                            <X size={14} /> Limpar
                        </button>
                    )}
                </div>

                {/* TABELA DE PRODUTOS */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-black/40 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-bold">Produto</th>
                                    <th className="p-4 font-bold text-center">Estoque Total</th>
                                    <th className="p-4 font-bold">Preço Unit.</th>
                                    <th className="p-4 font-bold">Categoria</th>
                                    <th className="p-4 font-bold flex items-center gap-2"><Calendar size={14} /> Data Criação</th>
                                    <th className="p-4 font-bold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-cyan-400 animate-pulse">Carregando dados...</td></tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const totalStock = getTotalStock(product.product_variants);

                                        return (
                                            <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-black border border-gray-700 overflow-hidden flex-shrink-0">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">IMG</div>
                                                            )}
                                                        </div>
                                                        <div className="max-w-[150px] md:max-w-xs">
                                                            <p className="font-bold text-white text-sm truncate">{product.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{product.description}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-4 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${totalStock === 0 ? 'bg-red-500/20 text-red-500' : totalStock < 5 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                                                        {totalStock} un.
                                                    </span>
                                                </td>

                                                <td className="p-4 font-medium text-gray-300">
                                                    R$ {Number(product.price).toFixed(2)}
                                                </td>

                                                <td className="p-4 text-sm text-gray-400">
                                                    {getCategoryName(product)}
                                                </td>

                                                <td className="p-4 text-sm text-gray-500 font-mono">
                                                    {formatDate(product.created_at)}
                                                </td>

                                                <td className="p-4 text-right">
                                                    {/* FIX: Sempre visível no Mobile, Hover no Desktop */}
                                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            href={`/admin/products/edit/${product.id}`}
                                                            className="p-3 md:p-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-3 md:p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                            title="Arquivar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-black/20 p-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between items-center">
                        <span>Exibindo {filteredProducts.length} produtos</span>
                        <span className="hidden md:inline">Data do Servidor convertida para Local</span>
                    </div>
                </div>
            </div>
        </main>
    );
}