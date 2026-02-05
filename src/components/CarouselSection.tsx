"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselSectionProps {
    title: string;
    children: React.ReactNode;
}

export function CarouselSection({ title, children }: CarouselSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left"
                ? scrollLeft - clientWidth * 0.7
                : scrollLeft + clientWidth * 0.7;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <section className="relative group/section">
            {/* Header da Categoria */}
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">{title}</h2>
                    <div className="h-1 w-12 bg-cyan-500 mt-2 transition-all group-hover/section:w-24" />
                </div>

                {/* Setas de Navegação (Desktop) */}
                <div className="hidden md:flex gap-3">
                    <button
                        onClick={() => scroll("left")}
                        className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all active:scale-90"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Container com Scroll */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
            >
                {children}
            </div>
        </section>
    );
}