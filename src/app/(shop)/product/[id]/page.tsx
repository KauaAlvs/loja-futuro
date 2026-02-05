import { supabase } from "@/lib/supabase";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Gera o título da aba do navegador com o nome do produto
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data: product } = await supabase.from('products').select('name').eq('id', id).single();
    return { title: product?.name || 'Detalhes do Produto' };
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // Busca produto, variantes e a árvore de categorias
    const { data: product } = await supabase
        .from('products')
        .select(`
            *,
            subcategories (
                id,
                name,
                categories (id, name)
            ),
            product_variants (*)
        `)
        .eq('id', id)
        .single();

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center pt-20">
                <h1 className="text-2xl font-black uppercase mb-4">Produto não encontrado</h1>
                <Link href="/" className="text-cyan-400 hover:underline">Voltar para Home</Link>
            </div>
        );
    }

    // Calcula estoque total para passar para o cliente
    const totalStock = product.product_variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;

    return (
        // CORREÇÃO DO GAP: pt-[85px] para colar na Navbar
        <main className="min-h-screen bg-[#050505] text-white pt-[85px] pb-20 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* --- BREADCRUMB DE NAVEGAÇÃO --- */}
                <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <ChevronRight size={12} />

                    {/* Link para a Categoria Pai */}
                    {product.subcategories?.categories && (
                        <>
                            <Link
                                href={`/?category=${product.subcategories.categories.name.toLowerCase()}`}
                                className="hover:text-cyan-400 transition-colors"
                            >
                                {product.subcategories.categories.name}
                            </Link>
                            <ChevronRight size={12} />
                        </>
                    )}

                    {/* Link para a Subcategoria */}
                    {product.subcategories && (
                        <>
                            <Link
                                href={`/?subcategory=${product.subcategories.name.toLowerCase()}`}
                                className="hover:text-cyan-400 transition-colors"
                            >
                                {product.subcategories.name}
                            </Link>
                            <ChevronRight size={12} />
                        </>
                    )}

                    <span className="text-white truncate">{product.name}</span>
                </nav>

                {/* --- COMPONENTE CLIENTE (Visual e Interatividade) --- */}
                <ProductDetailClient
                    product={product}
                    variants={product.product_variants || []}
                    totalStock={totalStock}
                />

            </div>
        </main>
    );
}