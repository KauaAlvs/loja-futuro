import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    id: string | number;        // ID do item no carrinho (pode ser Stock ID ou Variant ID)
    productId: string | number; // <--- NOVO: ID do Produto Pai (para o Link funcionar)
    variantId: string | number; // ID da variante (usado para remover/atualizar)
    name: string;
    price: number;
    quantity: number;
    image: string;
    color: string;
    size?: string | null;       // Opcional
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    toggleCart: () => void;
    addItem: (product: any, variant: any) => void;
    removeItem: (variantId: string | number) => void;
    updateQuantity: (variantId: string | number, quantity: number) => void;
    clearCart: () => void;
    addToCart: (item: any) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            // --- FUNÇÃO LEGADO (Mantida por segurança) ---
            addItem: (product, variant) => {
                const { items } = get();
                const existingItem = items.find((item) => item.variantId === variant.id);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.variantId === variant.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                        isOpen: true,
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                id: product.id,
                                productId: product.id, // Adicionado aqui também
                                variantId: variant.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                image: variant.image_url || product.image_url,
                                color: variant.color_name,
                                size: null
                            },
                        ],
                        isOpen: true,
                    });
                }
            },

            // --- NOVA FUNÇÃO (Usada pelo ProductDetailClient) ---
            addToCart: (newItem) => {
                const { items } = get();

                // Mapeia os dados recebidos para o formato da Store
                const itemToStore: CartItem = {
                    id: newItem.id,
                    productId: newItem.productId || newItem.id, // <--- PEGA O ID DO PAI AQUI
                    variantId: newItem.variant_id || newItem.id, // Fallback se não tiver variant_id
                    name: newItem.name,
                    price: newItem.price,
                    quantity: newItem.quantity,
                    image: newItem.image_url || "",
                    color: newItem.color || "",
                    size: newItem.size || null
                };

                // Verifica se já existe um item igual (mesmo ID, Variante e Tamanho)
                const existingItemIndex = items.findIndex((item) =>
                    (item.id === itemToStore.id) && 
                    (item.size === itemToStore.size) // Importante verificar tamanho para não somar P com M
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...items];
                    updatedItems[existingItemIndex].quantity += itemToStore.quantity;
                    set({ items: updatedItems, isOpen: true });
                } else {
                    set({ items: [...items, itemToStore], isOpen: true });
                }
            },

            removeItem: (variantId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.variantId !== variantId && item.id !== variantId),
                }));
            },

            updateQuantity: (variantId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        (item.variantId === variantId || item.id === variantId) 
                            ? { ...item, quantity: Math.max(1, quantity) } 
                            : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
        }),
        { name: "cart-storage-v2" }
    )
);