"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { updateCartItem as updateCartItemAction } from "@/actions/cart/update-cart-item";
import { removeCartItem as removeCartItemAction } from "@/actions/cart/remove-cart-item";
import { useCartStore } from "@/store/useCartStore";

export function CartContent({ cart, total: initialTotal }) {
    const [items, setItems] = useState(cart.items);
    const [total, setTotal] = useState(initialTotal);
    const [isUpdating, setIsUpdating] = useState({});

    // Zustand para sincronizar con el store local
    const { updateQuantity: updateLocalQuantity, removeItem: removeLocalItem } = useCartStore();

    /**
     * Actualizar cantidad (Cliente + Servidor)
     */
    const updateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) {
            await removeItem(item);
            return;
        }

        const itemKey = `${item.productId}-${item.variantColor || 'default'}`;
        setIsUpdating(prev => ({ ...prev, [itemKey]: true }));

        try {
            // 1. Actualizar optimísticamente en UI
            const previousItems = [...items];
            const previousTotal = total;

            const updatedItems = items.map(i =>
                i.id === item.id
                    ? { ...i, quantity: newQuantity }
                    : i
            );
            setItems(updatedItems);

            // Recalcular total
            const newTotal = updatedItems.reduce((sum, i) =>
                sum + (i.product.price * i.quantity), 0
            );
            setTotal(newTotal);

            // 2. Actualizar en Zustand (carrito local)
            updateLocalQuantity(item.productId, item.variantColor, newQuantity);

            // 3. Sincronizar con servidor
            const result = await updateCartItemAction(
                item.productId,
                item.variantColor,
                newQuantity
            );

            if (!result.ok) {
                // Revertir cambios si falla
                setItems(previousItems);
                setTotal(previousTotal);
                updateLocalQuantity(item.productId, item.variantColor, item.quantity);
                toast.error(result.message || "Error al actualizar cantidad");
            } else {
                toast.success("Cantidad actualizada");
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
            toast.error("Error al actualizar cantidad");
            // Aquí podrías recargar la página o el carrito desde el servidor
        } finally {
            setIsUpdating(prev => ({ ...prev, [itemKey]: false }));
        }
    };

    /**
     * Eliminar item (Cliente + Servidor)
     */
    const removeItem = async (item) => {
        const itemKey = `${item.productId}-${item.variantColor || 'default'}`;
        setIsUpdating(prev => ({ ...prev, [itemKey]: true }));

        try {
            // 1. Eliminar optimísticamente de UI
            const previousItems = [...items];
            const previousTotal = total;

            const filteredItems = items.filter(i => i.id !== item.id);
            setItems(filteredItems);

            // Recalcular total
            const newTotal = filteredItems.reduce((sum, i) =>
                sum + (i.product.price * i.quantity), 0
            );
            setTotal(newTotal);

            // 2. Eliminar de Zustand (carrito local)
            removeLocalItem(item.productId, item.variantColor);

            // 3. Sincronizar con servidor
            const result = await removeCartItemAction(
                item.productId,
                item.variantColor
            );

            if (result.ok) {
                toast.success("Producto eliminado del carrito");
            } else {
                // Revertir si falla
                setItems(previousItems);
                setTotal(previousTotal);
                toast.error(result.message || "Error al eliminar producto");
            }
        } catch (error) {
            console.error("Error removing item:", error);
            toast.error("Error al eliminar producto");
        } finally {
            setIsUpdating(prev => ({ ...prev, [itemKey]: false }));
        }
    };

    // Si el carrito está vacío después de eliminar items
    if (items.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <Link
                    href="/products"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Ir a la tienda
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                    const itemKey = `${item.productId}-${item.variantColor || 'default'}`;
                    const isItemUpdating = isUpdating[itemKey];

                    return (
                        <div
                            key={item.id}
                            className="relative flex gap-4 border rounded-lg p-4 bg-white"
                        >
                            {/* Loader overlay */}
                            {isItemUpdating && (
                                <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center z-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                </div>
                            )}

                            {/* Imagen */}
                            <div className="relative w-24 h-24 rounded overflow-hidden bg-gray-100 shrink-0">
                                <Image
                                    src={item.product.coverImages?.[0] || '/placeholder.jpg'}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Nombre y SKU */}
                                <Link
                                    href={`/products/${item.product.sku}`}
                                    className="font-semibold text-gray-900 hover:text-blue-600 block truncate"
                                >
                                    {item.product.name}
                                </Link>
                                <p className="text-xs text-gray-500">
                                    SKU: {item.product.sku}
                                </p>

                                {/* Variante de color */}
                                {item.variantColor && (
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: item.variantHex || '#000' }}
                                        />
                                        <span className="text-sm text-gray-600">
                                            {item.variantColor}
                                        </span>
                                    </div>
                                )}

                                {/* Precio */}
                                <p className="text-lg font-bold text-gray-900 mt-2">
                                    ${item.product.price.toLocaleString('es-AR')}
                                </p>z

                                {/* Controles de cantidad */}
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center border rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item, item.quantity - 1)}
                                            disabled={isItemUpdating || item.quantity <= 1}
                                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-30 transition"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 font-semibold">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item, item.quantity + 1)}
                                            disabled={isItemUpdating}
                                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-30 transition"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Subtotal del item */}
                                    <span className="text-sm text-gray-600">
                                        Subtotal: ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            {/* Botón eliminar */}
                            <button
                                onClick={() => removeItem(item)}
                                disabled={isItemUpdating}
                                className="text-red-600 hover:text-red-800 disabled:opacity-30 self-start"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Resumen del pedido */}
            <div className="border rounded-lg p-6 h-fit bg-white shadow-lg sticky top-4">
                <h2 className="text-xl font-bold mb-4 text-gray-900">
                    Resumen del pedido
                </h2>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({items.length} productos)</span>
                        <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span className="text-green-600 font-semibold">Gratis</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-blue-600">
                            ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <Link
                    href="/checkout"
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
                >
                    Proceder al pago
                </Link>

                <Link
                    href="/products"
                    className="block text-center text-blue-600 hover:text-blue-700 mt-4 text-sm font-medium"
                >
                    ← Continuar comprando
                </Link>
            </div>
        </div>
    );
}