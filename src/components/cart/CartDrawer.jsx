"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer({ isOpen, onClose }) {
    const { items, getTotal, updateQuantity, removeItem } = useCartStore();

    const total = getTotal();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        Tu Carrito ({items.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                            <button
                                onClick={onClose}
                                className="text-[#8c622a] font-semibold hover:underline"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <CartItem
                                key={`${item.id}-${item.variant?.color || 'default'}`}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))
                    )}
                </div>

                {/* Footer con total */}
                {items.length > 0 && (
                    <div className="border-t p-4 space-y-4">
                        {/* Subtotal */}
                        <div className="flex justify-between text-lg font-bold">
                            <span>Subtotal:</span>
                            <span className="text-[#8c622a]">
                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Botón checkout */}
                        <Link
                            href="/cart"
                            onClick={onClose}
                            className="block w-full bg-[#8c622a] text-white text-center py-3 rounded-lg font-semibold hover:brightness-110 transition"
                        >
                            Ir al Checkout
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full text-gray-600 text-sm hover:text-gray-900 transition"
                        >
                            Continuar comprando
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

// ===== Componente de Item individual =====
function CartItem({ item, onUpdateQuantity, onRemove }) {
    return (
        <div className="flex gap-4 bg-gray-50 p-3 rounded-lg">
            {/* Imagen */}
            <div className="relative w-20 h-20 rounded-md overflow-hidden bg-white shrink-0">
                <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                    {item.name}
                </h3>

                {/* Variante */}
                {item.variant && (
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.variant.hex }}
                        />
                        <span className="text-xs text-gray-600">
                            {item.variant.color}
                        </span>
                    </div>
                )}

                <p className="text-sm font-bold text-[#8c622a] mt-1">
                    ${item.price.toLocaleString('es-AR')}
                </p>

                {/* Controles */}
                <div className="flex items-center justify-between mt-2">
                    {/* Cantidad */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => onUpdateQuantity(
                                item.id,
                                item.variant?.color,
                                item.quantity - 1
                            )}
                            className="p-1 hover:bg-gray-100 transition"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(
                                item.id,
                                item.variant?.color,
                                item.quantity + 1
                            )}
                            className="p-1 hover:bg-gray-100 transition"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Eliminar */}
                    <button
                        onClick={() => onRemove(item.id, item.variant?.color)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}