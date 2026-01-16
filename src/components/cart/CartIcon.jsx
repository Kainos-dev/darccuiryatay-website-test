"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartIcon({
    onClick,
    iconClassname = ""
}) {
    const itemCount = useCartStore(state => state.getItemCount());
    const [hasMounted, setHasMounted] = useState(false);

    // 🔥 Esto garantiza que el componente solo renderice datos del store en el cliente
    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <button
            onClick={onClick}
            className="relative rounded-lg transition-colors cursor-pointer"
            aria-label="Carrito de compras"
        >
            <ShoppingCart size={24} className={`mb-1 cursor-pointer ${iconClassname}`} />
            {/* Badge con cantidad → solo render después del mount */}
            {hasMounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brown text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in duration-200">
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
        </button>
    );
}
