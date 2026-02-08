import { supabase } from "@/lib/supabase";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data: product } = await supabase.from('products').select('name').eq('id', id).single();
    return { title: product?.name ? `${product.name} | Loja do Futuro` : 'Detalhes do Produto' };
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            subcategories (id, name, categories (id, name)),
            product_variants (
                *,
                product_stock (*)
            )
        `)
        .eq('id', id)
        .single();

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
                <h1 className="text-3xl font-black uppercase mb-4 tracking-tighter text-red-500">Produto não encontrado</h1>
                <Link href="/" className="text-cyan-400 hover:underline font-bold uppercase tracking-widest text-xs">Voltar para a Home</Link>
            </div>
        );
    }

    /**
     * LÓGICA DE ESTOQUE GLOBAL (HÍBRIDA)
     * Para cada variante, decidimos se usamos a tabela de tamanhos ou a coluna stock.
     */
    const totalStock = product.product_variants?.reduce((acc: number, variant: any) => {
        const hasSizeRecords = variant.product_stock && variant.product_stock.length > 0;
        
        if (hasSizeRecords) {
            // É um item com tamanhos (Moda)
            const sizeSum = variant.product_stock.reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);
            return acc + sizeSum;
        } else {
            // É um item sem tamanhos (Eletrônico/Acessório)
            return acc + (Number(variant.stock) || 0);
        }
    }, 0) || 0;

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-[85px] pb-20 px-4">
            <div className="container mx-auto max-w-7xl">
                <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-10 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    {product.subcategories?.categories && (
                        <>
                            <Link href={`/?category=${product.subcategories.categories.name.toLowerCase()}`} className="hover:text-cyan-400 transition-colors">
                                {product.subcategories.categories.name}
                            </Link>
                            <ChevronRight size={12} />
                        </>
                    )}
                    <span className="text-white truncate">{product.name}</span>
                </nav>

                <ProductDetailClient
                    product={product}
                    variants={product.product_variants || []}
                    totalStock={totalStock}
                />
            </div>
        </main>
    );
}