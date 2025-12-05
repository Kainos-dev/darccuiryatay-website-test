'use client';

import { inter } from '@/app/ui/fonts';
import { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { addToCart } from '@/actions/cart/add-to-cart';
import { toast } from 'sonner';

export default function AddToCartButton({
    product,
    selectedVariant = null,
}) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    // ✅ Zustand store
    const addItem = useCartStore(state => state.addItem);

    // Determinar stock disponible
    const availableStock = selectedVariant?.stock ?? product.stock ?? 0;
    const isOutOfStock = availableStock === 0;

    // Handlers
    const increaseQuantity = () => {
        if (quantity < availableStock) {
            setQuantity(prev => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (isOutOfStock || isAdding) return;

        setIsAdding(true);

        // ✅ 1. OPTIMISTIC UPDATE - Actualizar UI inmediatamente
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.coverImages?.[0] || '',
            sku: product.sku,
            variant: selectedVariant ? {
                color: selectedVariant.color,
                hex: selectedVariant.hex
            } : null
        };

        // Agregar al store local (instantáneo)
        addItem(cartItem);

        // ✅ 2. SINCRONIZAR CON SERVIDOR
        try {
            const result = await addToCart(
                product.id,
                quantity,
                selectedVariant?.color
            );

            if (result.ok) {
                toast.success('✅ Producto agregado al carrito');
                setQuantity(1); // Reset cantidad
            } else {
                // Si falla, mostrar error (el store ya tiene el item)
                toast.error(result.message || 'Error al agregar producto');
                // Aquí podrías implementar un rollback si quieres
            }
        } catch (error) {
            toast.error('Error al agregar al carrito');
            console.error('Error:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className={`${inter.className} border-t border-gray-200 pt-6`}>

            {/* Stock */}
            <div className="mb-4">
                {isOutOfStock ? (
                    <p className="text-red-500 font-semibold">Sin stock disponible</p>
                ) : (
                    <p className="text-sm text-gray-600">
                        Stock disponible:{" "}
                        <span className="font-semibold text-gray-900">{availableStock}</span>
                    </p>
                )}
            </div>

            {/* Selector + Botón */}
            <div className="flex flex-col items-start gap-4">

                {/* Selector de cantidad */}
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <Minus size={20} className="text-gray-700" />
                    </button>

                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            if (val >= 1 && val <= availableStock) setQuantity(val);
                        }}
                        min="1"
                        max={availableStock}
                        disabled={isOutOfStock}
                        className="w-16 text-center font-semibold text-gray-900 border-x border-gray-300 focus:outline-none"
                    />

                    <button
                        onClick={increaseQuantity}
                        disabled={quantity >= availableStock || isOutOfStock}
                        className="p-2 hover:bg-gray-100 disabled:opacity-30 transition"
                    >
                        <Plus size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* Botón */}
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-sm font-semibold transition-all shadow-lg text-sm
                    ${isOutOfStock
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                            : isAdding
                                ? "bg-[#a0896c] text-white scale-[0.97]"
                                : "bg-[#8c622a] text-white hover:brightness-110 active:scale-95"}
                    `}
                >
                    {isAdding ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Agregando...
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={20} />
                            {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
                        </>
                    )}
                </button>
            </div>

            {/* Stock máximo */}
            {quantity >= availableStock && !isOutOfStock && (
                <p className="text-xs text-amber-600 mt-2">⚠️ Has alcanzado el stock máximo disponible</p>
            )}
        </div>
    );
}