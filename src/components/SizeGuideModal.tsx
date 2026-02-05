"use client";

import { X, Ruler, Info } from "lucide-react";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "clothing" | "footwear";
}

export function SizeGuideModal({ isOpen, onClose, type }: SizeGuideModalProps) {
    if (!isOpen) return null;

    // Dados da Grade de Roupas
    const clothingGrades = [
        { ref: "PP", h: "66 - 68", w: "45 - 47" },
        { ref: "P", h: "69 - 71", w: "48 - 50" },
        { ref: "M", h: "71 - 73", w: "51 - 53" },
        { ref: "G", h: "73 - 75", w: "54 - 56" },
        { ref: "GG", h: "75 - 78", w: "57 - 60" },
        { ref: "XG", h: "78 - 81", w: "61 - 64" },
    ];

    // Dados da Grade de Calçados (33 ao 45)
    const footwearGrades = [
        { br: "33", us: "4.5", cm: "22.0" },
        { br: "34", us: "5.0", cm: "22.5" },
        { br: "35", us: "5.5", cm: "23.0" },
        { br: "36", us: "6.0", cm: "24.0" },
        { br: "37", us: "7.0", cm: "24.5" },
        { br: "38", us: "7.5", cm: "25.5" },
        { br: "39", us: "8.0", cm: "26.0" },
        { br: "40", us: "8.5", cm: "26.5" },
        { br: "41", us: "9.5", cm: "27.5" },
        { br: "42", us: "10.0", cm: "28.0" },
        { br: "43", us: "11.0", cm: "29.0" },
        { br: "44", us: "12.0", cm: "29.5" },
        { br: "45", us: "12.5", cm: "30.0" },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Overlay com desfoque */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Botão Fechar */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full z-30"
                >
                    <X size={20} />
                </button>

                {/* Cabeçalho do Modal */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 text-cyan-400">
                        <Ruler size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Guia de Medidas</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                            {type === "clothing" ? "Vestuário e Camisetas" : "Calçados e Sneakers"}
                        </p>
                    </div>
                </div>

                {/* Container da Tabela com Scroll */}
                <div className="overflow-y-auto max-h-[50vh] border border-white/5 rounded-3xl relative">
                    <table className="w-full text-left text-xs border-collapse">
                        {/* O segredo está no 'sticky top-0'. 
                          Adicionamos bg-[#0d0d0d] para cobrir o conteúdo que passa por trás.
                        */}
                        <thead className="sticky top-0 z-20 bg-[#0d0d0d]">
                            <tr className="bg-white/5 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                                {type === "clothing" ? (
                                    <>
                                        <th className="px-6 py-4">Tamanho</th>
                                        <th className="px-6 py-4">Altura (cm)</th>
                                        <th className="px-6 py-4">Largura (cm)</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-4 border-b border-white/5">BR</th>
                                        <th className="px-6 py-4 border-b border-white/5">US</th>
                                        <th className="px-6 py-4 border-b border-white/5">Palmilha (cm)</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-bold text-gray-300">
                            {type === "clothing" ? (
                                clothingGrades.map((item) => (
                                    <tr key={item.ref} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white font-black">{item.ref}</td>
                                        <td className="px-6 py-4">{item.h}</td>
                                        <td className="px-6 py-4">{item.w}</td>
                                    </tr>
                                ))
                            ) : (
                                footwearGrades.map((item) => (
                                    <tr key={item.br} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white font-black">{item.br}</td>
                                        <td className="px-6 py-4">{item.us}</td>
                                        <td className="px-6 py-4">{item.cm}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info Box */}
                <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5">
                    <Info className="text-cyan-400 shrink-0" size={18} />
                    <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wide">
                        As medidas são aproximadas. Recomendamos comparar com uma peça de uso habitual para garantir o ajuste ideal.
                    </p>
                </div>
            </div>
        </div>
    );
}