import { supabase } from "@/lib/supabase";
import {
  ArrowRight, Package, Truck, ShieldCheck, Zap,
  Clock, Star, Box, ArrowUpRight, ShoppingBag, Flame, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { CarouselSection } from "@/components/CarouselSection";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({
  searchParams
}: {
  searchParams: { category?: string; subcategory?: string }
}) {
  // 1. Busca produtos (já ordenados por ID desc = mais novos primeiro)
  const { data: products } = await supabase
    .from('products')
    .select(`*, product_variants (*), subcategories (name, categories (name))`)
    .eq('archived', false)
    .order('id', { ascending: false });

  // 2. Filtra produtos com estoque > 0
  const availableProducts = products?.filter((product) => {
    const totalStock = product.product_variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
    return totalStock > 0;
  }) || [];

  // --- SEÇÕES INTELIGENTES ---

  // A. LANÇAMENTOS (Pega os 10 primeiros da lista geral)
  const newArrivals = availableProducts.slice(0, 10);

  // B. QUERIDINHOS (Filtra pela coluna que criamos no banco)
  const bestSellers = availableProducts.filter((p) => p.is_featured === true);

  // 3. Lógica de Filtro da URL (Categoria/Subcategoria)
  const filteredProducts = availableProducts.filter((product) => {
    const normalize = (str: string) => str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const catFilter = normalize(searchParams.category || "");
    const subFilter = normalize(searchParams.subcategory || "");

    const prodSub = normalize(product.subcategories?.name || "");
    const prodCat = normalize(product.subcategories?.categories?.name || "");

    if (subFilter) return prodSub === subFilter;
    if (catFilter) return prodCat === catFilter;

    return true;
  });

  // 4. Agrupamento por Categoria
  const productsByCategory: Record<string, any[]> = {};
  filteredProducts.forEach((product) => {
    const categoryName = product.subcategories?.categories?.name || "Geral";
    if (!productsByCategory[categoryName]) productsByCategory[categoryName] = [];
    productsByCategory[categoryName].push(product);
  });

  const isFiltered = !!(searchParams.category || searchParams.subcategory);

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-cyan-500/30">

      {/* HERO SECTION */}
      {!isFiltered && (
        <section className="relative h-[80vh] w-full flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2000"
              className="w-full h-full object-cover opacity-30 brightness-[0.4]"
              alt="Hero Tech"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] z-10" />
          </div>

          <div className="container mx-auto px-6 relative z-20 pt-20">
            <div className="max-w-4xl space-y-4 md:space-y-6">
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">
                Lançamento 2026
              </span>
              <h1 className="text-5xl md:text-[8rem] font-black tracking-tighter leading-[0.85] uppercase">
                Vista a <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Inovação.</span>
              </h1>
              <p className="max-w-xl text-gray-400 text-base md:text-xl font-medium leading-relaxed">
                A Future Store traz a convergência entre tecidos inteligentes e o design urbano minimalista.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <a href="#lancamentos" className="bg-white text-black font-black px-8 md:px-10 py-4 md:py-5 rounded-2xl hover:bg-cyan-400 transition-all duration-500 flex items-center gap-3 text-[10px] md:text-xs uppercase tracking-widest shadow-2xl">
                  Ver Coleção <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TRUST BAR */}
      {!isFiltered && (
        <div className="border-y border-white/5 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-8">
            <TrustItem icon={Truck} title="Envio Expresso" sub="Todo o Brasil" />
            <TrustItem icon={ShieldCheck} title="Segurança" sub="Criptografia SSL" />
            <TrustItem icon={Zap} title="Original" sub="Peças Autênticas" />
            <TrustItem icon={Star} title="Favorita" sub="+10k Clientes" />
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO */}
      <div className={`container mx-auto px-6 space-y-24 md:space-y-32 ${isFiltered ? 'pt-32' : 'pt-24'}`}>

        {/* FEEDBACK DO FILTRO */}
        {isFiltered && (
          <div className="mb-12 border-b border-white/10 pb-6">
            <h2 className="text-cyan-400 font-black uppercase text-xs tracking-widest mb-2">Exibindo resultados para:</h2>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              {searchParams.subcategory || searchParams.category}
            </h1>
            <Link href="/" className="inline-flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              Limpar Filtros
            </Link>
          </div>
        )}

        {/* --- 1. LANÇAMENTOS (Automático: Últimos 10 adicionados) --- */}
        {!isFiltered && newArrivals.length > 0 && (
          <div id="lancamentos" className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Flame className="text-cyan-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Lançamentos</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Chegaram essa semana</p>
              </div>
            </div>

            <CarouselSection title="">
              {newArrivals.map((product: any) => (
                <div key={product.id} className="min-w-[200px] md:min-w-[280px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </CarouselSection>
          </div>
        )}

        {/* --- 2. OS QUERIDINHOS (Manual: Produtos marcados com checkbox) --- */}
        {!isFiltered && bestSellers.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                  Os Queridinhos
                </h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Destaques da Loja</p>
              </div>
            </div>

            <CarouselSection title="">
              {bestSellers.map((product: any) => (
                <div key={product.id} className="min-w-[200px] md:min-w-[280px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </CarouselSection>
          </div>
        )}

        {/* --- 3. TODAS AS CATEGORIAS --- */}
        {Object.keys(productsByCategory).length > 0 ? (
          Object.entries(productsByCategory).map(([category, items]) => (
            <CarouselSection key={category} title={category}>
              {items.map((product: any) => (
                <div key={product.id} className="min-w-[200px] md:min-w-[280px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </CarouselSection>
          ))
        ) : (
          <div className="py-20 text-center">
            <Box className="mx-auto text-gray-800 mb-4" size={48} />
            <p className="text-gray-500 font-medium">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>

      {/* BENTO GRID */}
      {!isFiltered && (
        <section className="mt-32 md:mt-40 container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-black p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 flex flex-col justify-end relative overflow-hidden group min-h-[300px]">
              <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all">
                <ShoppingBag size={150} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tighter">Qualidade Sem <br className="hidden md:block" /> Compromissos.</h2>
              <p className="text-gray-500 max-w-sm text-xs md:text-sm font-medium leading-relaxed">
                Materiais de grau industrial adaptados para o conforto do dia a dia.
              </p>
            </div>
            <div className="bg-[#080808] p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 flex flex-col items-center text-center justify-center">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="text-cyan-400" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-black mb-3 uppercase tracking-tight">Suporte Veloz</h3>
              <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed font-medium">Respostas em até 15 minutos via canais oficiais.</p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function TrustItem({ icon: Icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="text-cyan-500" size={24} />
      <div>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white leading-none mb-1">{title}</p>
        <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase">{sub}</p>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <div className="group relative bg-[#080808] border border-white/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-white/20 shadow-xl">
      <Link href={`/product/${product.id}`} className="relative aspect-square block overflow-hidden bg-gray-900">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 md:group-hover:brightness-50"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-800"><Package size={40} /></div>
        )}

        <div className="absolute inset-0 hidden md:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-[2px]">
          <span className="text-2xl font-black mb-4">R$ {product.price.toFixed(2)}</span>
          <div className="bg-white text-black p-4 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <ArrowUpRight size={24} />
          </div>
        </div>
      </Link>

      <div className="p-4 md:p-6 text-center">
        <h3 className="font-bold text-white uppercase text-[10px] md:text-xs tracking-widest truncate group-hover:text-cyan-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-cyan-400 font-bold text-sm mt-2 md:hidden">
          R$ {product.price.toFixed(2)}
        </p>
        <p className="text-[8px] md:text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] mt-2">
          {product.subcategories?.name || "Premium Gear"}
        </p>
      </div>
    </div>
  );
}