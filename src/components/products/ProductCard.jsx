"use client";

import { useState } from 'react';
import { barlow, inter } from '@/app/ui/fonts';
import Link from 'next/link';
import Image from 'next/image';

const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
    }).format(price);
};

export default function ProductCard({ product }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <Link
            href={`/products/${product.id}`}
            className="block"
        >
            <div
                className={`${barlow.className} cursor-pointer flex flex-col h-full rounded-md shadow-md transition-all hover:shadow-[0_0_10px_rgba(0,0,0,0.25)]`}
                /* onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)} */
            >
                {/* Contenedor de imagen */}
                <div className="relative w-full overflow-hidden rounded-md bg-none shrink-0">
                    <Image
                        src={"https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760909716/Frente_tbiemu.jpg"}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="w-full h-auto object-cover"
                    />
                    {product.collection?.some(item => item.toLowerCase() === "senderos") && (
                        <span className="absolute top-0 left-0 bg-[#A27B5C] rounded-tl-md text-white py-1 px-2 font-semibold">
                            SENDEROS
                        </span>
                    )}

                </div>

                <div className="font-(--font-barlow) p-4 sm:p-6 lg:p-8 mt-4 sm:mt-8 lg:mt-12 relative flex-1 flex flex-col justify-between">
                    <h2 className="text-lg sm:text-xl lg:text-3xl font-semibold">
                        {product.name}
                    </h2>

                    <div className={`font-(--font-inter) flex w-full ${product.price == 0 ? "justify-end" : "justify-between"} items-center mt-2 sm:mt-3 lg:mt-4 text-base sm:text-lg lg:text-2xl`}>
                        {
                            product.price > 0 && (
                                <span>{formatPrice(product.price)}</span>
                            )
                        }
                        <div className="flex items-center gap-1">
                            {product.variants.slice(0, 2).map((variant) => (
                                <div
                                    key={variant.color.name}
                                    className="w-6 h-6 rounded-full border"
                                    style={{ backgroundColor: variant.color.hex }}
                                    title={variant.color.name}
                                ></div>
                            ))}
                            {product.variants.length > 2 && (
                                <span className="text-sm sm:text-base">
                                    +{product.variants.length - 2}
                                </span>
                            )}
                        </div>
                    </div>
                    <span className={`${inter.className} mt-1`}>Código SKU: <b>{product.sku}</b></span>
                </div>
            </div>
        </Link>
    );
}