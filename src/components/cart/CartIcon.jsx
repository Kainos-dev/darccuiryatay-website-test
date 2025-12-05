"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartIcon({ onClick }) {
    const itemCount = useCartStore(state => state.getItemCount());

    return (
        <button
            onClick={onClick}
            className="relative p-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Carrito de compras"
        >
            <ShoppingCart size={32} className="text-gray-200 hover:text-gray-400" />

            {/* Badge con cantidad */}
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8c622a] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-in zoom-in duration-200">
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
        </button>
    );
}