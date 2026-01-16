// components/ProductCard.jsx
'use client';
import { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { barlow, inter } from '@/app/ui/fonts';
import { CldImage } from 'next-cloudinary';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(price);
};

const ProductCard = memo(({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Lógica de imágenes
    const hasMultipleCoverImages = product.coverImages?.length >= 2;
    const hasCoverImages = product.coverImages?.length > 0;

    const mainImage = hasCoverImages
        ? product.coverImages[0]
        : product.variants?.[0]?.images?.[0];

    const alternativeImage = hasMultipleCoverImages
        ? product.coverImages[1]
        : null;

    const hasMainImage = typeof mainImage === 'string' && mainImage.trim().length > 0;

    // Badge SENDEROS
    const isSenderos = product.collection?.some(
        item => item.toLowerCase() === 'senderos'
    );

    return (
        <Link href={`/products/${product.id}`} className="block h-full">
            <div
                className={`${inter.className} cursor-pointer flex flex-col h-full rounded-md shadow-md transition-all hover:shadow-[0_0_10px_rgba(0,0,0,0.25)]`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Contenedor de imagen optimizado */}
                <div className="relative w-full aspect-square overflow-hidden rounded-t-sm bg-white shrink-0">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-white animate-pulse flex justify-center items-center font-medium">CARGANDO IMAGEN</div>
                    )}

                    {/* Sin imagen */}
                    {!hasMainImage && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-lg font-semibold">
                            Sin imagen disponible
                        </div>
                    )}

                    {/* Con imágenes - Optimizado */}
                    {hasMainImage && (
                        <>
                            {/* Imagen principal */}
                            <CldImage
                                src={mainImage}
                                alt={product.name}
                                fill
                                quality="auto"
                                format="auto"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className={`object-contain transition-opacity duration-500 ${hasMultipleCoverImages && isHovered ? 'opacity-0' : 'opacity-100'
                                    }`}
                            />

                            {/* Imagen alternativa en hover */}
                            {hasMultipleCoverImages && (
                                <Image
                                    src={alternativeImage}
                                    alt={`${product.name} - Vista alternativa`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
                                        }`}
                                    loading="lazy"
                                    onLoad={() => setImageLoaded(true)}
                                />
                            )}
                        </>
                    )}

                    {/* Badge SENDEROS */}
                    {isSenderos && (
                        <span className="absolute top-0 left-0 bg-brown rounded-tl-sm text-white py-1 px-2 text-sm font-semibold z-10">
                            SENDEROS
                        </span>
                    )}
                </div>

                {/* Info del producto */}
                <div className="p-4 sm:p-6 lg:p-8  relative flex-1 flex flex-col justify-between bg-white rounded-b-sm">
                    <h2 className={`${barlow.className} text-lg sm:text-xl lg:text-3xl font-semibold line-clamp-2`}>
                        {product.name}
                    </h2>

                    <span className={`${inter.className} mt-1 text-sm sm:text-base`}>
                        Código SKU: <b>{product.sku}</b>
                    </span>

                    <div
                        className={`flex w-full ${product.price === 0 ? 'justify-end' : 'justify-between'
                            } items-center mt-2 sm:mt-3 lg:mt-4 text-base sm:text-lg lg:text-xl`}
                    >
                        {product.price > 0 && (
                            <span className="font-semibold">{formatPrice(product.price)}</span>
                        )}

                        {/* Colores de variantes */}
                        {product.variants?.length > 0 && (
                            <div className="flex items-center gap-1">
                                {product.variants.slice(0, 2).map((variant, idx) => (
                                    <div
                                        key={variant.color?.name || idx}
                                        className="w-6 h-6 rounded-full border border-gray-300"
                                        style={{ backgroundColor: variant.color?.hex || '#ccc' }}
                                        title={variant.color?.name || 'Color'}
                                    />
                                ))}

                                {product.variants.length > 2 && (
                                    <span className="text-sm sm:text-base text-gray-600">
                                        +{product.variants.length - 2}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;