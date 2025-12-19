"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { clearCart as clearCartAction } from "@/actions/cart/clear-cart";
import { updateCartItem as updateCartItemAction } from "@/actions/cart/update-cart-item";
import { removeCartItem as removeCartItemAction } from "@/actions/cart/remove-cart-item";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { inter, habibi } from "@/app/ui/fonts";
import { toast } from "sonner";

export default function CartPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    /* console.log("🚀 ~ CartPage ~ searchParams:", searchParams) */
    const from = searchParams.get("from") || "/"; // fallback
    console.log("🚀 ~ CartPage ~ from:", from)
    const { items, getTotal, updateQuantity, removeItem, clearCart } = useCartStore();

    const total = getTotal();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // ✅ Función para vaciar carrito (cliente + servidor)
    const handleClearCart = async () => {
        if (!confirm('¿Estás seguro de vaciar el carrito?')) return;

        try {
            // 1. Limpiar en el cliente (optimistic)
            clearCart();

            // 2. Limpiar en el servidor
            const result = await clearCartAction();

            if (result.ok) {
                toast.success('Carrito vaciado');
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Error al vaciar el carrito');
            console.error(error);
        }
    };

    // Si el carrito está vacío
    if (items.length === 0) {
        return (
            <div className={`${inter.className} min-h-screen bg-gray-50 flex items-center justify-center px-4`}>
                <div className="text-center max-w-md">
                    <ShoppingBag size={80} className="mx-auto text-gray-300 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Tu carrito está vacío
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Parece que aún no has agregado ningún producto. ¡Explora nuestra tienda!
                    </p>
                    {/* <Link
                        href="/products"
                        className="inline-flex items-center gap-2 bg-[#8c622a] text-white px-6 py-3 rounded-lg font-semibold hover:brightness-110 transition"
                    >
                        <ArrowLeft size={20} />
                        Ir a la tienda
                    </Link> */}

                    <Link
                        href={from}
                        className={`${habibi.className} inline-flex items-center gap-2 bg-brown text-white px-6 py-3 rounded-lg font-semibold hover:brightness-110 transition`}
                    >
                        <ArrowLeft size={20} />
                        IR A PRODUCTOS
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`${inter.className} min-h-screen bg-gray-50 py-8`}>
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-brown transition mb-4"
                    >
                        <ArrowLeft size={20} />
                        Continuar comprando
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Carrito de compras
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'} en tu carrito
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Lista de productos */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <CartItemCard
                                key={`${item.id}-${item.variant?.color || 'default'}`}
                                item={item}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}

                        {/* Botón limpiar carrito */}
                        <button
                            onClick={handleClearCart}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
                        >
                            Vaciar carrito
                        </button>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Resumen del pedido
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-green-600 font-semibold">Gratis</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-brown">
                                        ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* Botón proceder al pago */}
                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-brown text-white py-3 rounded-lg font-semibold hover:brightness-110 transition shadow-lg"
                            >
                                Realizar pedido
                            </button>

                            {/* Info adicional */}
                            {/* <div className="mt-6 pt-6 border-t space-y-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Envío gratis en compras mayores a $50.000</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Garantía de devolución de 30 días</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-green-600">✓</span>
                                    <span>Pago seguro encriptado</span>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ===== Componente individual de producto =====
function CartItemCard({ item, onUpdateQuantity, onRemove }) {
    const [isUpdating, setIsUpdating] = useState(false);

    // ✅ Actualizar cantidad (cliente + servidor)
    const handleUpdateQuantity = async (newQuantity) => {
        if (newQuantity < 1) return;

        setIsUpdating(true);

        try {
            // 1. Actualizar en cliente (optimistic)
            onUpdateQuantity(item.id, item.variant?.color, newQuantity);

            // 2. Actualizar en servidor
            const result = await updateCartItemAction(
                item.id,
                item.variant?.color,
                newQuantity
            );

            if (!result.ok) {
                // Revertir si falla
                toast.error(result.message);
                // Aquí podrías recargar el carrito desde el servidor
            }
        } catch (error) {
            toast.error('Error al actualizar cantidad');
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };

    // ✅ Eliminar item (cliente + servidor)
    const handleRemove = async () => {
        try {
            // 1. Eliminar del cliente (optimistic)
            onRemove(item.id, item.variant?.color);

            // 2. Eliminar del servidor
            const result = await removeCartItemAction(
                item.id,
                item.variant?.color
            );

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

    return (
        <div className="bg-white rounded-xl shadow-md p-4 flex gap-4 relative">
            {/* Loader overlay */}
            {isUpdating && (
                <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown" />
                </div>
            )} 

            {/* Imagen */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                            {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    </div>

                    {/* Botón eliminar */}
                    <button
                        onClick={handleRemove}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar producto"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                {/* Variante */}
                {item.variant && (
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="w-5 h-5 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: item.variant.hex }}
                        />
                        <span className="text-sm text-gray-600">
                            Color: {item.variant.color}
                        </span>
                    </div>
                )}

                {/* Precio y controles */}
                <div className="flex items-center justify-between mt-4">
                    {/* Selector de cantidad */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                            onClick={() => handleUpdateQuantity(item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 disabled:opacity-30 transition"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="px-4 font-semibold text-gray-900">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => handleUpdateQuantity(item.quantity + 1)}
                            disabled={item.quantity >= (item.stock || 999)}
                            className="p-2 hover:bg-gray-100 disabled:opacity-30 transition"
                        >
                            <Plus size={16} />
                        </button>
                    </div>

                    {/* Precio */}
                    <div className="text-right">
                        <p className="text-xl font-bold text-brown">
                            ${(item.price * item.quantity).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-500">
                            ${item.price.toLocaleString('es-AR')} c/u
                        </p>
                    </div>
                </div>

                {/* Stock disponible */}
                {item.stock && item.stock < 5 && (
                    <p className="text-xs text-orange-600 mt-2">
                        ⚠️ Solo quedan {item.stock} unidades disponibles
                    </p>
                )}
            </div>
        </div>
    );
}