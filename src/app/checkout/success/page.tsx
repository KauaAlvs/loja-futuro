"use client";

import { useEffect } from "react";
import { useCartStore } from "../../store/cartStore";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
    const { clearCart } = useCartStore();

    useEffect(() => {
        // Limpa o carrinho imediatamente após a confirmação do pagamento
        clearCart();
    }, [clearCart]);

    return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="bg-gray-900 border border-gray-800 p-8 md:p-12 rounded-[2.5rem] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-500">

                <div className="flex justify-center mb-8">
                    <div className="bg-green-500/10 p-5 rounded-full border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <CheckCircle className="text-green-500" size={64} />
                    </div>
                </div>

                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Pedido Realizado!</h1>
                <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                    Recebemos seu pagamento com sucesso. Agora é com a gente!
                    Você receberá todas as atualizações do seu pacote por e-mail.
                </p>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/"
                        className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
                    >
                        <ShoppingBag size={22} /> Continuar Comprando
                    </Link>

                    <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-2">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                        Aguardando separação no estoque
                    </p>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-800/50">
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-[0.2em]">
                        FutureStore © 2026 - Tecnologia & Estilo
                    </p>
                </div>
            </div>
        </main>
    );
}