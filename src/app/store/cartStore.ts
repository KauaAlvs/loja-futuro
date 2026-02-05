import { create } from "zustand";
import { persist } from "zustand/middleware";

// Mantendo a interface original para não quebrar o Checkout
export interface CartItem {
    id: number;
    variantId: number;   // O Checkout usa isso
    name: string;
    price: number;
    quantity: number;
    image: string;       // O Checkout usa isso (não image_url)
    color: string;
    size?: string;       // ADICIONADO: Opcional, para não quebrar código antigo
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    // Funções Originais (Mantidas)
    toggleCart: () => void;
    addItem: (product: any, variant: any) => void;
    removeItem: (variantId: number) => void;
    updateQuantity: (variantId: number, quantity: number) => void;
    clearCart: () => void;

    // NOVA FUNÇÃO (Para funcionar com a página de produto nova)
    addToCart: (item: any) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            // --- SEU CÓDIGO ANTIGO (MANTIDO) ---
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
                                variantId: variant.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                image: variant.image_url || product.image_url,
                                color: variant.color_name
                            },
                        ],
                        isOpen: true,
                    });
                }
            },

            // --- NOVA FUNÇÃO DE ADAPTADOR ---
            // Recebe o formato novo e converte para o formato antigo
            addToCart: (newItem) => {
                const { items } = get();

                // Mapeia: image_url -> image | variant_id -> variantId
                const itemToStore: CartItem = {
                    id: newItem.id,
                    variantId: newItem.variant_id || 0,
                    name: newItem.name,
                    price: newItem.price,
                    quantity: newItem.quantity,
                    image: newItem.image_url || "",
                    color: newItem.color || "",
                    size: newItem.size // Salva o tamanho se vier
                };

                // Verifica se já existe (agora considerando o tamanho também)
                const existingItemIndex = items.findIndex((item) =>
                    item.id === itemToStore.id &&
                    item.variantId === itemToStore.variantId &&
                    item.size === itemToStore.size
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...items];
                    updatedItems[existingItemIndex].quantity += itemToStore.quantity;
                    set({ items: updatedItems, isOpen: true });
                } else {
                    set({ items: [...items, itemToStore], isOpen: true });
                }
            },

            // --- FUNÇÕES ANTIGAS (MANTIDAS) ---
            removeItem: (variantId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.variantId !== variantId),
                }));
            },

            updateQuantity: (variantId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.variantId === variantId ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
        }),
        { name: "cart-storage-v2" }
    )
);