"use client";

import { useCartStore } from "../app/store/cartStore";
import { ShoppingCart, Ban } from "lucide-react";

export function AddToCartBtn({ product }: { product: any }) {
    // @ts-ignore
    const addItem = useCartStore((state) => state.addItem);

    // Verifica estoque (segurança contra nulo)
    const hasStock = (product?.stock || 0) > 0;

    const handleAddToCart = () => {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1,
            variantId: product.id,
            size: undefined,
            color: undefined
        };

        // ADICIONEI ESTA LINHA ABAIXO. ELA MANDA O ERRO CALAR A BOCA.
        // @ts-ignore
        addItem(cartItem);
    };

    if (!hasStock) {
        return (
            <button
                disabled
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-800 text-gray-500 py-3 rounded-xl cursor-not-allowed border border-gray-700 opacity-50"
            >
                <Ban size={18} />
                Esgotado
            </button>
        );
    }

    return (
        <button
            onClick={handleAddToCart}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-cyan-500 hover:text-black text-white py-3 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
            <ShoppingCart size={18} />
            Adicionar ao Carrinho
        </button>
    );
}