"use client";

import { inter, habibi } from "@/app/ui/fonts";
import { useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { updateCartItem as updateCartItemAction } from "@/actions/cart/update-cart-item";
import { removeCartItem as removeCartItemAction } from "@/actions/cart/remove-cart-item";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function CartDrawer({ rubro, isOpen, onClose }) {
    const { items, getTotal, updateQuantity, removeItem } = useCartStore();

    const total = getTotal();

    // ✅ Handler para actualizar cantidad (cliente + servidor)
    const handleUpdateQuantity = async (productId, variantColor, newQuantity) => {
        try {
            // 1. Optimistic update (cliente)
            updateQuantity(productId, variantColor, newQuantity);

            // 2. Actualizar servidor
            const result = await updateCartItemAction(productId, variantColor, newQuantity);

            if (!result.ok) {
                toast.error(result.message);
                // Aquí podrías revertir el cambio si falla (opcional)
            }
        } catch (error) {
            toast.error('Error al actualizar cantidad');
            console.error(error);
        }
    };

    // ✅ Handler para eliminar item (cliente + servidor)
    const handleRemoveItem = async (productId, variantColor) => {
        try {
            // 1. Optimistic update (cliente)
            removeItem(productId, variantColor);

            // 2. Eliminar del servidor
            const result = await removeCartItemAction(productId, variantColor);

            if (result.ok) {
                toast.success('Producto eliminado');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Error al eliminar producto');
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`${inter.className} fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300`}>

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
                                className="text-brown font-semibold hover:underline"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <CartItem
                                key={`${item.id}-${item.variant?.color || 'default'}`}
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemove={handleRemoveItem}
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
                            <span className="text-brown">
                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Botón checkout */}
                        <Link
                            href={`/cart?from=/${rubro}`}
                            onClick={onClose}
                            className={`block w-full bg-brown text-white text-center py-3 rounded-lg font-semibold hover:brightness-110 transition`}
                        >
                            Ir al Checkout
                        </Link>

                        <button
                            onClick={onClose}
                            className={`${habibi.className} w-full text-gray-600 text-sm hover:text-gray-900 transition cursor-pointer`}
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
    // Estado por-item para bloquear botones mientras se hace la request
    const [isUpdating, setIsUpdating] = useState(false);

    // Maneja cambios de cantidad (client + server) evitando spam clicks
    const handleUpdate = async (newQty) => {
        // evita cantidades inválidas
        if (newQty < 1) return;
        if (newQty === item.quantity) return;
        if (isUpdating) return;

        try {
            setIsUpdating(true);
            // Llamamos al handler del padre (optimistic update ya maneja el store)
            await onUpdateQuantity(item.id, item.variant?.color, newQty);
        } catch (err) {
            console.error(err);
            // opcional: toast aquí
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveClick = async () => {
        if (isUpdating) return; // evita conflictos mientras actualiza
        setIsUpdating(true);
        try {
            await onRemove(item.id, item.variant?.color);
        } finally {
            setIsUpdating(false);
        }
    };

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

                <p className="text-sm font-bold text-brown mt-1">
                    ${item.price.toLocaleString('es-AR')}
                </p>

                {/* Controles */}
                <div className="flex items-center justify-between mt-2 text-gray-800">
                    {/* Cantidad */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => handleUpdate(item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="p-1 hover:bg-gray-100 disabled:opacity-30 transition"
                            aria-label="Disminuir cantidad"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => handleUpdate(item.quantity + 1)}
                            disabled={item.quantity >= (item.stock || 999) || isUpdating}
                            className="p-1 hover:bg-gray-100 disabled:opacity-30 transition"
                            aria-label="Aumentar cantidad"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Eliminar */}
                    <button
                        onClick={handleRemoveClick}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-30"
                        disabled={isUpdating}
                        aria-label="Eliminar producto"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}