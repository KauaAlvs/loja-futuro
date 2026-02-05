"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Plus,
    Trash2,
    Folder,
    Layers,
    Loader2,
    ChevronRight,
    X,
    AlertCircle,
    Edit3,
    Check
} from "lucide-react";

export default function UnifiedCategoriesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados para criação
    const [newCategory, setNewCategory] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

    // Estados para EDIÇÃO
    const [editMode, setEditMode] = useState<{ id: number; type: 'cat' | 'sub' } | null>(null);
    const [editValue, setEditValue] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const { data: categories, error } = await supabase
            .from('categories')
            .select(`*, subcategories (*)`)
            .order('name', { ascending: true });

        if (error) console.error(error);
        else setData(categories || []);
        setLoading(false);
    }

    const generateSlug = (text: string) => {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    };

    // --- FUNÇÕES DE SALVAMENTO (UPDATE) ---
    async function handleUpdate() {
        if (!editMode || !editValue.trim()) return;

        const table = editMode.type === 'cat' ? 'categories' : 'subcategories';
        const payload: any = { name: editValue };

        if (editMode.type === 'cat') {
            payload.slug = generateSlug(editValue);
        }

        const { error } = await supabase.from(table).update(payload).eq('id', editMode.id);

        if (error) alert("Erro ao atualizar: " + error.message);
        else {
            setEditMode(null);
            fetchData();
        }
    }

    // --- HANDLERS CRIAÇÃO ---
    async function handleAddCategory() {
        if (!newCategory) return;
        const { error } = await supabase.from('categories').insert([{
            name: newCategory,
            slug: generateSlug(newCategory)
        }]);
        if (error) alert(error.message);
        else { setNewCategory(""); fetchData(); }
    }

    async function handleAddSubcategory() {
        if (!newSubcategory || !selectedParentId) return;
        const { error } = await supabase.from('subcategories').insert([{
            name: newSubcategory,
            category_id: Number(selectedParentId)
        }]);
        if (error) alert(error.message);
        else { setNewSubcategory(""); setSelectedParentId(null); fetchData(); }
    }

    // --- HANDLERS DELETE ---
    async function handleDeleteCategory(id: number) {
        if (!confirm("Aviso: Isso pode afetar produtos. Continuar?")) return;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) alert("Erro: Remova as subcategorias antes.");
        else fetchData();
    }

    async function handleDeleteSubcategory(id: number) {
        if (!confirm("Excluir subcategoria?")) return;
        await supabase.from('subcategories').delete().eq('id', id);
        fetchData();
    }

    return (
        <main className="p-4 md:p-8 pt-24 text-white min-h-screen">
            <div className="container mx-auto max-w-5xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                        Estrutura do Catálogo
                    </h1>
                    <p className="text-gray-400 text-sm">Gerencie departamentos e subgrupos de produtos.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUNA DE CADASTRO */}
                    <div className="space-y-6">
                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-bold text-cyan-400 uppercase mb-4 flex items-center gap-2">
                                <Plus size={16} /> Nova Categoria
                            </h3>
                            <input
                                type="text" placeholder="Ex: Calçados"
                                value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none mb-3"
                            />
                            <button onClick={handleAddCategory} className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold transition-all text-sm text-white">
                                Criar Principal
                            </button>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl">
                            <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 flex items-center gap-2">
                                <Layers size={16} /> Nova Subcategoria
                            </h3>
                            <select
                                value={selectedParentId || ""} onChange={e => setSelectedParentId(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-purple-500 outline-none mb-3 text-gray-300"
                            >
                                <option value="">Vincular à categoria...</option>
                                {data.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <input
                                type="text" placeholder="Ex: Tênis"
                                value={newSubcategory} onChange={e => setNewSubcategory(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-purple-500 outline-none mb-3"
                            />
                            <button onClick={handleAddSubcategory} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-bold transition-all text-sm text-white">
                                Adicionar Sub
                            </button>
                        </div>
                    </div>

                    {/* COLUNA DE LISTAGEM */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="py-20 text-center"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={32} /></div>
                        ) : data.map((category) => (
                            <div key={category.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden group">

                                {/* CABEÇALHO CATEGORIA */}
                                <div className="p-4 flex items-center justify-between bg-black/20">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="bg-cyan-500/10 p-2 rounded-lg"><Folder className="text-cyan-400" size={20} /></div>

                                        {/* CORREÇÃO TYPESCRIPT: Verificando se editMode existe antes de acessar propriedades */}
                                        {editMode && editMode.id === category.id && editMode.type === 'cat' ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    autoFocus
                                                    value={editValue} onChange={e => setEditValue(e.target.value)}
                                                    className="bg-black border border-cyan-500 rounded px-2 py-1 text-sm outline-none w-full max-w-[200px]"
                                                />
                                                <button onClick={handleUpdate} className="text-green-500 p-1 hover:bg-green-500/10 rounded"><Check size={18} /></button>
                                                <button onClick={() => setEditMode(null)} className="text-gray-500 p-1 hover:bg-gray-500/10 rounded"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <h2 className="font-bold text-white">{category.name}</h2>
                                                <button
                                                    onClick={() => { setEditMode({ id: category.id, type: 'cat' }); setEditValue(category.name); }}
                                                    className="text-gray-600 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* LISTA SUBCATEGORIAS */}
                                <div className="p-4 flex flex-wrap gap-2 items-center bg-gray-900/30">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase mr-2"><ChevronRight size={12} className="inline" /> Subs:</span>
                                    {category.subcategories?.map((sub: any) => (
                                        <div key={sub.id} className="flex items-center gap-2 bg-gray-800 border border-gray-700 px-3 py-1 rounded-full group/sub">

                                            {/* CORREÇÃO TYPESCRIPT: Verificando se editMode existe antes de acessar propriedades */}
                                            {editMode && editMode.id === sub.id && editMode.type === 'sub' ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        autoFocus
                                                        value={editValue} onChange={e => setEditValue(e.target.value)}
                                                        className="bg-black border-b border-purple-500 text-xs outline-none w-20 px-1"
                                                    />
                                                    <button onClick={handleUpdate} className="text-green-500"><Check size={12} /></button>
                                                    <button onClick={() => setEditMode(null)} className="text-gray-500"><X size={12} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-300">{sub.name}</span>
                                                    <button
                                                        onClick={() => { setEditMode({ id: sub.id, type: 'sub' }); setEditValue(sub.name); }}
                                                        className="text-gray-500 hover:text-purple-400 opacity-0 group-hover/sub:opacity-100 transition-opacity"
                                                    >
                                                        <Edit3 size={10} />
                                                    </button>
                                                    <button onClick={() => handleDeleteSubcategory(sub.id)} className="text-gray-500 hover:text-red-400">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {(!category.subcategories || category.subcategories.length === 0) && (
                                        <span className="text-xs text-gray-600 italic">Vazio</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 p-4 border-t border-gray-800 flex items-center gap-3 text-gray-500 text-xs">
                    <AlertCircle size={16} />
                    <p>Ao editar o nome de uma categoria, o slug amigável da URL também será atualizado automaticamente.</p>
                </div>
            </div>
        </main>
    );
}