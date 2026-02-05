"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { X, Save, Loader2 } from "lucide-react";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    productToEdit?: any; // <--- NOVO: Aceita um produto opcional
}

export function ProductModal({ isOpen, onClose, onSuccess, productToEdit }: ProductModalProps) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        image_url: "",
    });

    // EFEITO MÁGICO: Quando o modal abre, verifica se é Edição ou Novo
    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                // Modo Edição: Preenche o formulário
                setFormData({
                    name: productToEdit.name,
                    description: productToEdit.description || "",
                    price: productToEdit.price.toString(),
                    stock: productToEdit.stock.toString(),
                    image_url: productToEdit.image_url || "",
                });
            } else {
                // Modo Novo: Limpa o formulário
                setFormData({ name: "", description: "", price: "", stock: "", image_url: "" });
            }
        }
    }, [isOpen, productToEdit]);

    if (!isOpen) return null;

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                image_url: formData.image_url,
            };

            let error;

            if (productToEdit) {
                // --- MODO ATUALIZAR (UPDATE) ---
                const response = await supabase
                    .from("products")
                    .update(productData) // Atualiza os dados
                    .eq("id", productToEdit.id); // Onde o ID for igual ao do produto
                error = response.error;
            } else {
                // --- MODO CRIAR (INSERT) ---
                const response = await supabase
                    .from("products")
                    .insert([productData]);
                error = response.error;
            }

            if (error) throw error;

            alert(productToEdit ? "Produto atualizado! 🔄" : "Produto cadastrado! 🚀");
            onSuccess();
            onClose();

        } catch (error) {
            console.error(error);
            alert("Erro ao salvar produto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    {/* Título Dinâmico */}
                    <h2 className="text-xl font-bold text-white">
                        {productToEdit ? "Editar Equipamento" : "Novo Equipamento"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Nome</label>
                            <input
                                name="name" required value={formData.name} onChange={handleChange}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Preço</label>
                                <input
                                    name="price" required type="number" step="0.01" value={formData.price} onChange={handleChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-green-500 outline-none text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Estoque</label>
                                <input
                                    name="stock" required type="number" value={formData.stock} onChange={handleChange}
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Imagem URL</label>
                            <input
                                name="image_url" value={formData.image_url} onChange={handleChange}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                            <textarea
                                name="description" rows={3} value={formData.description} onChange={handleChange}
                                className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none text-white"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                            <button
                                type="submit" disabled={loading}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                {productToEdit ? "Atualizar" : "Salvar"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}