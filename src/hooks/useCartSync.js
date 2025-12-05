"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { getCart } from "@/actions/cart/get-cart";

export function useCartSync() {
    const syncWithServer = useCartStore(state => state.syncWithServer);

    useEffect(() => {
        async function syncCart() {
            try {
                const result = await getCart();

                if (result.ok && result.items) {
                    // Sincronizar items con el store
                    syncWithServer(result.items);
                }
            } catch (error) {
                console.error("Error sincronizando carrito:", error);
            }
        }

        syncCart();
    }, [syncWithServer]);
}