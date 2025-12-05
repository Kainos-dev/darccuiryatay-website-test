// src/store/useCartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            // Estado
            items: [],
            isLoading: false,

            // Getters computados
            getItemCount: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },

            getTotal: () => {
                return get().items.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0);
            },

            // Encontrar item (con o sin variante)
            findItem: (productId, variantColor = null) => {
                return get().items.find(item => {
                    if (variantColor) {
                        return item.id === productId && item.variant?.color === variantColor;
                    }
                    return item.id === productId && !item.variant;
                });
            },

            // ✅ AGREGAR AL CARRITO (Optimistic Update)
            addItem: (cartItem) => {
                set({ isLoading: true });

                const existingItem = get().findItem(cartItem.id, cartItem.variant?.color);

                if (existingItem) {
                    // Actualizar cantidad
                    set(state => ({
                        items: state.items.map(item =>
                            item === existingItem
                                ? { ...item, quantity: item.quantity + cartItem.quantity }
                                : item
                        )
                    }));
                } else {
                    // Agregar nuevo item
                    set(state => ({
                        items: [...state.items, cartItem]
                    }));
                }

                set({ isLoading: false });
            },

            // ✅ ACTUALIZAR CANTIDAD
            updateQuantity: (productId, variantColor, newQuantity) => {
                if (newQuantity <= 0) {
                    get().removeItem(productId, variantColor);
                    return;
                }

                set(state => ({
                    items: state.items.map(item => {
                        const matches = variantColor
                            ? item.id === productId && item.variant?.color === variantColor
                            : item.id === productId && !item.variant;

                        return matches ? { ...item, quantity: newQuantity } : item;
                    })
                }));
            },

            // ✅ REMOVER ITEM
            removeItem: (productId, variantColor = null) => {
                set(state => ({
                    items: state.items.filter(item => {
                        if (variantColor) {
                            return !(item.id === productId && item.variant?.color === variantColor);
                        }
                        return !(item.id === productId && !item.variant);
                    })
                }));
            },

            // ✅ LIMPIAR CARRITO
            clearCart: () => {
                set({ items: [] });
            },

            // ✅ SINCRONIZAR CON SERVIDOR
            syncWithServer: (serverItems) => {
                set({ items: serverItems });
            },

            // ✅ REVERTIR UPDATE (si falla el servidor)
            revertUpdate: (previousState) => {
                set({ items: previousState });
            }
        }),
        {
            name: 'cart-storage', // Nombre en localStorage
            partialize: (state) => ({ items: state.items }) // Solo persistir items
        }
    )
);