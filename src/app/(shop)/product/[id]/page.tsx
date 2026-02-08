import { supabase } from "@/lib/supabase";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Gera os metadados da página (Título na aba do navegador)
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', id)
        .single();
    
    return { 
        title: product?.name ? `${product.name} | Loja do Futuro` : 'Detalhes do Produto' 
    };
}

/**
 * Server Component: Busca os dados brutos do Banco de Dados
 */
export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    // A query agora entra em 3 níveis: Produto -> Variantes -> Estoque (Tamanhos)
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            subcategories (
                id,
                name,
                categories (id, name)
            ),
            product_variants (
                *,
                product_stock (*)
            )
        `)
        .eq('id', id)
        .single();

    // Caso o produto não exista ou ocorra erro na busca
    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
                <div className="bg-white/5 border border-white/10 p-12 rounded-[2.5rem] text-center max-w-md">
                    <h1 className="text-3xl font-black uppercase mb-4 tracking-tighter">Produto não encontrado</h1>
                    <p className="text-gray-500 text-sm mb-8 font-medium">O item que você procura pode ter sido removido ou o link está incorreto.</p>
                    <Link 
                        href="/" 
                        className="inline-block w-full py-4 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all"
                    >
                        Voltar para a Vitrine
                    </Link>
                </div>
            </div>
        );
    }

    /**
     * LÓGICA DE ESTOQUE TOTAL:
     * O estoque real do produto é a soma da coluna 'quantity' de todos os registros
     * na tabela 'product_stock' vinculados a este produto.
     */
    const totalStock = product.product_variants?.reduce((acc: number, variant: any) => {
        const variantTotal = variant.product_stock?.reduce((sum: number, stockItem: any) => {
            return sum + (stockItem.quantity || 0);
        }, 0) || 0;
        return acc + variantTotal;
    }, 0) || 0;

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-[85px] pb-20 px-4">
            <div className="container mx-auto max-w-7xl">

                {/* --- NAVEGAÇÃO (BREADCRUMB) --- */}
                <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-10 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
                    <ChevronRight size={12} className="flex-shrink-0" />

                    {product.subcategories?.categories && (
                        <>
                            <Link
                                href={`/?category=${product.subcategories.categories.name.toLowerCase()}`}
                                className="hover:text-cyan-400 transition-colors"
                            >
                                {product.subcategories.categories.name}
                            </Link>
                            <ChevronRight size={12} className="flex-shrink-0" />
                        </>
                    )}

                    {product.subcategories && (
                        <>
                            <Link
                                href={`/?subcategory=${product.subcategories.name.toLowerCase()}`}
                                className="hover:text-cyan-400 transition-colors"
                            >
                                {product.subcategories.name}
                            </Link>
                            <ChevronRight size={12} className="flex-shrink-0" />
                        </>
                    )}

                    <span className="text-white truncate">{product.name}</span>
                </nav>

                {/* --- COMPONENTE DE INTERAÇÃO (CLIENT-SIDE) --- */}
                {/* Passamos o objeto product, a lista de variantes (que já contém o product_stock)
                    e o totalStock calculado para o componente que lida com o estado da página.
                */}
                <ProductDetailClient
                    product={product}
                    variants={product.product_variants || []}
                    totalStock={totalStock}
                />

            </div>
        </main>
    );
}