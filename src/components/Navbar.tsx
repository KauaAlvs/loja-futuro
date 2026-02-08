"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, User, ChevronRight, Zap, ChevronDown } from "lucide-react";
import { useCartStore } from "../app/store/cartStore";
import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CartSidebar } from "./CartSidebar";
import { supabase } from "@/lib/supabase";

function NavbarContent() {
    const { items, toggleCart } = useCartStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
        async function fetchMenu() {
            const { data } = await supabase
                .from('categories')
                .select('*, subcategories(*)');
            if (data) setCategories(data);
        }
        fetchMenu();
    }, []);

    // Fecha o menu automaticamente ao mudar de rota
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname, searchParams]);

    const handleNavigation = () => setIsMobileMenuOpen(false);

    if (!mounted) return <div className="h-20 bg-black w-full fixed top-0 z-[100] border-b border-white/10" />;
    if (pathname.startsWith("/admin")) return null;

    return (
        <>
            {/* --- NAVBAR PRINCIPAL (SEMPRE NO TOPO z-[100]) --- */}
            <nav className="fixed top-0 left-0 w-full bg-black border-b border-white/10 z-[100] h-20 flex items-center">
                <div className="container mx-auto px-4 flex items-center justify-between">

                    {/* LOGO */}
                    <Link href="/" onClick={handleNavigation} className="flex items-center gap-2 text-2xl font-black italic shrink-0 z-[101]">
                        <Zap size={24} className="text-cyan-400" />
                        <span className="text-white flex">FUTURE<span className="text-cyan-400">STORE</span></span>
                    </Link>

                    {/* MENU DESKTOP */}
                    <div className="hidden lg:flex gap-8 text-sm font-medium text-gray-300 h-full items-center">
                        <Link href="/" className="hover:text-white transition-colors uppercase tracking-wide">Início</Link>

                        {categories.map((cat) => (
                            <div key={cat.id} className="relative group h-full flex items-center">
                                <Link
                                    href={`/category/${cat.id}`}
                                    className="flex items-center gap-1 hover:text-white transition-colors uppercase tracking-wide py-6"
                                >
                                    {cat.name} <ChevronDown size={14} className="text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                </Link>

                                {/* Dropdown Desktop */}
                                <div className="absolute top-[60px] left-0 w-56 bg-black border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                                    <div className="flex flex-col py-2">
                                        {cat.subcategories?.map((sub: any) => (
                                            <Link
                                                key={sub.id}
                                                href={`/category/${cat.id}?sub=${sub.id}`}
                                                className="px-6 py-3 text-xs font-bold uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between group/item"
                                            >
                                                {sub.name}
                                                <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 text-cyan-400 transition-opacity" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ÍCONES E BOTÃO DE MENU */}
                    <div className="flex items-center gap-6 z-[101]">
                        <button onClick={toggleCart} className="relative text-gray-300 hover:text-cyan-400 transition-colors">
                            <ShoppingCart size={24} />
                            {items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-cyan-500 text-black text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                                    {items.length}
                                </span>
                            )}
                        </button>

                        {/* BOTÃO DO MENU MOBILE (Alterna entre Menu e X) */}
                        <button 
                            className="lg:hidden text-white active:scale-90 transition-transform" 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X size={28} className="text-red-500 animate-in spin-in-90 duration-200" />
                            ) : (
                                <Menu size={28} className="animate-in fade-in duration-200" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- MENU MOBILE (FICA POR BAIXO DA NAVBAR z-[90]) --- */}
            {/* padding-top-20 (pt-20) garante que o conteúdo comece depois da navbar */}
            <div 
                className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-[90] lg:hidden flex flex-col pt-20 transition-all duration-300 ease-out ${
                    isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
                }`}
            >
                <div className="flex flex-col h-full p-8 overflow-y-auto">
                    {/* Link Home Mobile */}
                    <Link href="/" onClick={handleNavigation} className="text-4xl font-black uppercase italic py-5 border-b border-white/10 text-white">
                        Início
                    </Link>

                    {/* Categorias Mobile */}
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col border-b border-white/10 py-2 animate-in slide-in-from-right-8 fade-in duration-500" style={{ animationDelay: '100ms' }}>
                            <Link
                                href={`/category/${cat.id}`}
                                onClick={handleNavigation}
                                className="text-3xl font-black uppercase italic py-4 text-white flex justify-between items-center active:text-cyan-400"
                            >
                                {cat.name} <ChevronRight size={20} className="text-gray-800" />
                            </Link>

                            <div className="flex flex-wrap gap-3 pb-4 pl-2">
                                {cat.subcategories?.map((sub: any) => (
                                    <Link
                                        key={sub.id}
                                        href={`/category/${cat.id}?sub=${sub.id}`}
                                        onClick={handleNavigation}
                                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 px-3 py-2 rounded-lg active:bg-cyan-500 active:text-black hover:border-cyan-400 transition-colors"
                                    >
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Rodapé Mobile */}
                    <div className="mt-auto py-8 text-center text-gray-600 text-xs uppercase tracking-widest">
                        <p>© 2026 Future Store Inc.</p>
                    </div>
                </div>
            </div>

            <CartSidebar />
        </>
    );
}

export function Navbar() {
    return (
        <Suspense fallback={null}>
            <NavbarContent />
        </Suspense>
    );
}