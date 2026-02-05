"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FilterProps {
    sortOption: string;
    categoryId: string;
    subId?: string;
}

export function FilterDropdown({ sortOption, categoryId, subId }: FilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Função para navegar e fechar o menu
    const handleSort = (sort: string) => {
        setIsOpen(false);
        // Constroi a URL mantendo a subcategoria se existir
        const url = `/category/${categoryId}?${subId ? `sub=${subId}&` : ''}sort=${sort}`;
        router.push(url);
    };

    const labels: Record<string, string> = {
        'newest': 'Mais Recentes',
        'price_asc': 'Menor Preço',
        'price_desc': 'Maior Preço',
        'oldest': 'Mais Antigos'
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-[#0A0A0A] border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-white/5 transition-colors text-white active:scale-95"
            >
                <Filter size={14} className="text-cyan-400" />
                {labels[sortOption] || 'Filtrar'}
                {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Menu Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => handleSort('newest')} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 border-b border-white/5">
                        Mais Recentes
                    </button>
                    <button onClick={() => handleSort('price_asc')} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 border-b border-white/5">
                        Menor Preço
                    </button>
                    <button onClick={() => handleSort('price_desc')} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5">
                        Maior Preço
                    </button>
                </div>
            )}
        </div>
    );
}