'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

//components
import Image from 'next/image';
import CartIcon from '../cart/CartIcon';
import CartDrawer from '../cart/CartDrawer';
import AddToCartComponent from '../cart/AddToCartButton';

import { inter } from '@/app/ui/fonts';

export default function ProductViewInfo({
    userRole,
    product,
    variants,
    setCurrentImageIndex
}) {
    const router = useRouter();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showGuiaTalles, setShowGuiaTalles] = useState(false);

    const toggleGuiaTalles = () => {
        setShowGuiaTalles(prev => !prev);
    };

    const isAdmin = userRole === "admin";
    const isWholesale = userRole === "mayorista";
    const isRetail = !isAdmin && !isWholesale;

    const displayCollection = useMemo(() => {
        return product.collection
            ?.filter(item => item.toLowerCase() !== "news")
            .map(item => item.charAt(0).toUpperCase() + item.slice(1))
            .join(" / ");
    }, [product.collection]);

    const hasVariants = product.variants?.length > 0;
    /* const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variants[0] : null); */
    const [selectedVariant, setSelectedVariant] = useState(null);


    const handleColorChange = useCallback((variant) => {
        if (selectedVariant?.color.hex === variant.color.hex) {
            setSelectedVariant(null);
            return;
        }

        setSelectedVariant(variant);

        const imageIndex = variants.get(variant.color.hex);
        if (imageIndex !== undefined) {
            setCurrentImageIndex(imageIndex);
        }
    }, [variants, selectedVariant]);


    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };


    return (
        <div className={`${inter.className} relative lg:w-1/2 w-full flex flex-col gap-6 p-6 lg:p-12 overflow-y-auto`}>
            <div>
                {displayCollection && (
                    <p className="text-sm lg:text-base text-white uppercase tracking-wide bg-[#90682f] px-2 py-1 rounded-sm inline">
                        {displayCollection}
                    </p>
                )}

                <div className="mt-10 flex items-start justify-between gap-6">
                    {/* Izquierda: info producto */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">
                            Código SKU: <b className="text-gray-700">{product.sku || product.id}</b>
                        </span>

                        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            {product.name}
                        </h1>
                    </div>

                    {/* Derecha: acciones */}
                    <div className="flex items-center gap-3">
                        <CartIcon
                            onClick={() => setIsCartOpen(true)}
                            iconClassname='text-black hover:text-gray-400'
                        />

                        <CartDrawer
                            isOpen={isCartOpen}
                            onClose={() => setIsCartOpen(false)}
                        />
                    </div>
                </div>

            </div>

            <div className="border-t border-gray-200 pt-4 lg:pt-6">
                {/* ADMIN → ve ambos */}
                {isAdmin && (
                    <>
                        <p className="text-lg sm:text-xl lg:text-3xl">
                            Precio minorista: $
                            {product.price > 0
                                ? product.price.toLocaleString('es-AR')
                                : 'Consultar'}
                        </p>

                        {product.priceWholesale && (
                            <p className="text-base text-gray-600 mt-2">
                                Precio mayorista: $
                                {product.priceWholesale.toLocaleString('es-AR')}
                            </p>
                        )}
                    </>
                )}

                {/* MAYORISTA */}
                {isWholesale && product.priceWholesale && (
                    <p className="text-lg sm:text-xl lg:text-3xl">
                        Precio Mayorista: $
                        {product.priceWholesale.toLocaleString('es-AR')}
                    </p>
                )}

                {/* MINORISTA / GUEST */}
                {isRetail && (
                    <p className="text-lg sm:text-xl lg:text-3xl">
                        Precio Minorista: $
                        {product.price > 0
                            ? product.price.toLocaleString('es-AR')
                            : 'Consultar'}
                    </p>
                )}
            </div>

            {/* Selector de Colores */}
            {hasVariants && (
                <div className="border-t border-gray-200 pt-4 lg:pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Colores Disponibles
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {product.variants.map((variant, index) => (
                            <button
                                key={variant.color.hex + index}
                                onClick={() => handleColorChange(variant)}
                                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg border-2 transition ${selectedVariant?.color.hex === variant.color.hex
                                    ? "border-gray-800 bg-gray-50"
                                    : "border-gray-300 hover:border-gray-500"
                                    }`}
                                aria-label={`Seleccionar color ${variant.color.name}`}
                            >
                                <div
                                    className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border border-gray-300"
                                    style={{ backgroundColor: variant.color.hex }}
                                />
                                <span className="text-sm lg:text-base font-medium">
                                    {variant.color.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Información adicional */}
            {product.description && (
                <div className="border-t border-gray-200 pt-4 lg:pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-700">{product.description}</p>
                </div>
            )}

            {/* Botón Volver */}
            <button
                onClick={handleBack}
                className="px-2 lg:px-4 py-1 lg:py-2 bg-[#90682f] text-center text-white rounded hover:bg-[#9b7d53] text-sm lg:text-base mt-20 w-[20%] lg:absolute lg:bottom-12 lg:right-12"
            >
                VOLVER
            </button>

            <AddToCartComponent product={product} selectedVariant={selectedVariant} />


            {/* Guía de Talles */}
            {product.guiaTalles && (
                <div className="mt-6">

                    <button
                        onClick={() => setShowGuiaTalles(prev => !prev)}
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <span>
                            {showGuiaTalles ? "Ocultar guía de talles" : "Ver guía de talles"}
                        </span>

                        {/* Flecha */}
                        <svg
                            className={`w-4 h-4 transition-transform duration-300 ${showGuiaTalles ? "rotate-180" : "rotate-0"
                                }`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    {/* Contenido colapsable */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${showGuiaTalles ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0"
                            }`}
                    >
                        <img
                            src={product.guiaTalles}
                            alt="Guía de talles"
                            className="w-full max-w-md rounded border"
                        />
                    </div>
                </div>
            )}

        </div>
    )
}