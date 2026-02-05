import { supabase } from "@/lib/supabase";
import { Package, ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { FilterDropdown } from "@/components/FilterDropdown";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoryPage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ sub?: string; sort?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const categoryId = params.id;
    const subcategoryId = searchParams.sub;
    const sortOption = searchParams.sort || 'newest';

    // 1. Busca Informações da Categoria (Nome)
    const { data: category } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();

    let subcategoryName = "";
    if (subcategoryId) {
        const { data: sub } = await supabase
            .from('subcategories')
            .select('name')
            .eq('id', subcategoryId)
            .single();
        if (sub) subcategoryName = sub.name;
    }

    // 2. Query de Produtos (Busca TUDO primeiro)
    let query = supabase
        .from('products')
        .select(`
            *,
            product_variants (*),
            subcategories!inner (id, name, category_id)
        `)
        .eq('archived', false)
        .eq('subcategories.category_id', categoryId);

    if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
    }

    // Aplica a ordenação na query do banco
    switch (sortOption) {
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
        default: // 'newest'
            query = query.order('created_at', { ascending: false });
    }

    const { data: rawProducts } = await query;

    // 3. FILTRAGEM DE ESTOQUE (A Mágica acontece aqui)
    // Removemos qualquer produto que a soma das variantes seja 0
    const products = rawProducts?.filter((product) => {
        const totalStock = product.product_variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
        return totalStock > 0;
    }) || [];

    return (
        <main className="min-h-screen bg-[#050505] text-white pt-[85px] pb-20">
            <div className="container mx-auto px-4">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 border-b border-white/10 pb-4">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-cyan-400 mb-2 transition-colors">
                            <ArrowLeft size={14} /> Voltar para Home
                        </Link>

                        <h1 className="text-2xl md:text-4xl font-black flex items-center gap-2 uppercase italic tracking-tighter">
                            {category?.name || "Categoria"}
                            {subcategoryName && (
                                <>
                                    <span className="text-gray-700">/</span>
                                    <span className="text-cyan-400">{subcategoryName}</span>
                                </>
                            )}
                        </h1>
                        <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">
                            {products.length} produtos disponíveis
                        </p>
                    </div>

                    {/* Filtro Dropdown */}
                    <div className="w-full md:w-auto flex justify-end">
                        <FilterDropdown
                            sortOption={sortOption}
                            categoryId={categoryId}
                            subId={subcategoryId}
                        />
                    </div>
                </div>

                {/* --- GRID DE PRODUTOS --- */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    // ESTADO VAZIO (Nenhum produto disponível)
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                        <div className="bg-white/5 p-6 rounded-full mb-4">
                            <Package size={32} className="text-gray-600" />
                        </div>
                        <h2 className="text-lg font-black uppercase italic mb-1">Nada por aqui...</h2>
                        <p className="text-gray-500 text-xs mb-6 max-w-xs mx-auto">
                            Todos os itens desta categoria foram vendidos ou ainda não chegaram.
                        </p>
                        <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-black font-black py-3 px-6 rounded-xl text-xs uppercase tracking-widest">
                            Ver Outras Categorias
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

// --- CARD (Sem badge de Esgotado, pois eles não aparecem mais) ---
function ProductCard({ product }: { product: any }) {
    return (
        <div className="group relative bg-[#080808] border border-white/5 rounded-2xl md:rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col h-full">
            <Link href={`/product/${product.id}`} className="relative aspect-[4/5] md:aspect-square block overflow-hidden bg-gray-900">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-800"><Package size={32} /></div>
                )}

                {/* Preço Desktop (Hover Slide) */}
                <div className="absolute inset-0 hidden md:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-[2px]">
                    <span className="text-xl font-black mb-2">R$ {product.price.toFixed(2)}</span>
                    <div className="bg-white text-black p-3 rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
            </Link>

            <div className="p-3 md:p-5 flex flex-col flex-1">
                <h3 className="font-bold text-white uppercase text-[10px] md:text-xs tracking-widest truncate group-hover:text-cyan-400 transition-colors">
                    {product.name}
                </h3>

                {/* Preço Mobile */}
                <p className="text-cyan-400 font-bold text-sm mt-1 md:hidden">
                    R$ {product.price.toFixed(2)}
                </p>

                <p className="text-[8px] md:text-[9px] text-gray-600 font-black uppercase tracking-wider mt-1 truncate">
                    {product.subcategories?.name || "Future Gear"}
                </p>
            </div>
        </div>
    );
}