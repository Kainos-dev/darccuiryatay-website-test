// components/products/ProductView.jsx
'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ZoomOverlay from './ZoomOverlay';
import ProductViewInfo from './ProductViewInfo';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';

export default function ProductView({
    product,
    userRole
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 👇 Estados para zoom (solo en desktop)
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);

    // 👇 Detectar dispositivo táctil
    const isTouchDevice = useIsTouchDevice();

    // Validación temprana
    if (!product) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Producto no disponible</p>
            </div>
        );
    }

    // Memoizar cálculos costosos
    const imageData = useMemo(() => {
        const coverImages = product.coverImages || [];
        const variantsWithImages = (product.variants || []).filter(v => v.images?.length > 0);
        const hasVariantImages = variantsWithImages.length > 0;

        const allImages = hasVariantImages
            ? [...coverImages, ...variantsWithImages.flatMap(v => v.images)]
            : coverImages;

        const variantImageIndices = new Map();
        if (hasVariantImages) {
            let currentIndex = coverImages.length;

            for (const variant of product.variants || []) {
                if (variant.images?.length > 0) {
                    variantImageIndices.set(variant.color.hex, currentIndex);
                    currentIndex += variant.images.length;
                }
            }
        }

        return {
            allImages,
            hasVariantImages,
            variantImageIndices,
            coverImagesCount: coverImages.length
        };
    }, [product.coverImages, product.variants]);

    const { allImages, variantImageIndices } = imageData;

    // 👇 Handlers de zoom (solo activos en desktop)
    const handleZoomMove = useCallback((e) => {
        if (isTouchDevice || !imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({ x, y });
    }, [isTouchDevice]);

    const handleZoomEnter = () => {
        if (!isTouchDevice) {
            setIsZooming(true);
        }
    };

    const handleZoomLeave = () => {
        if (!isTouchDevice) {
            setIsZooming(false);
        }
    };

    // Handlers optimizados
    const nextImage = useCallback(() => {
        if (allImages.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }
    }, [allImages.length]);

    const prevImage = useCallback(() => {
        if (allImages.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
        }
    }, [allImages.length]);

    // Si no hay imágenes, mostrar mensaje
    if (allImages.length === 0) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Este producto no tiene imágenes disponibles</p>
            </div>
        );
    }

    // Navegación por teclado (solo desktop)
    useEffect(() => {
        if (isTouchDevice) return;

        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nextImage, prevImage, isTouchDevice]);

    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Carrusel de imágenes */}
            <div className="lg:w-1/2 w-full flex flex-col gap-4 p-4 lg:p-8 bg-gray-50">
                <div
                    onMouseEnter={handleZoomEnter}
                    onMouseLeave={handleZoomLeave}
                    className="relative flex-1"
                >
                    {/* Imagen principal */}
                    <div
                        ref={imageContainerRef}
                        onMouseMove={handleZoomMove}
                        className={`relative bg-white rounded-lg overflow-hidden min-h-[450px] lg:min-h-[825px] ${!isTouchDevice ? 'cursor-crosshair' : ''
                            }`}
                    >
                        <CldImage
                            src={allImages[currentImageIndex]}
                            alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            crop="fill"
                            className="w-full h-full object-contain"
                            gravity="auto"
                            quality="auto:best"
                            format="auto"
                            priority={currentImageIndex === 0}
                        />

                        {/* Lupa (solo desktop) */}
                        {!isTouchDevice && isZooming && (
                            <div
                                className="absolute w-32 h-32 border-2 border-gray-800/50 rounded-md pointer-events-none bg-white/20 backdrop-blur-sm"
                                style={{
                                    left: `${zoomPosition.x}%`,
                                    top: `${zoomPosition.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            />
                        )}

                        {/* Prefetch siguiente imagen */}
                        {allImages[currentImageIndex + 1] && (
                            <link
                                rel="prefetch"
                                as="image"
                                href={allImages[currentImageIndex + 1]}
                            />
                        )}

                        {/* Botones de navegación */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full cursor-pointer p-2 transition z-10"
                                    aria-label="Imagen anterior"
                                >
                                    <ChevronLeft size={24} className="text-gray-800" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full cursor-pointer p-2 transition z-10"
                                    aria-label="Siguiente imagen"
                                >
                                    <ChevronRight size={24} className="text-gray-800" />
                                </button>

                                <div className="absolute bottom-2 lg:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 lg:px-3 py-1 rounded-full text-sm z-10">
                                    {currentImageIndex + 1} / {allImages.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Miniaturas */}
                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition ${currentImageIndex === idx
                                        ? 'border-gray-800'
                                        : 'border-gray-300 hover:border-gray-500'
                                    }`}
                                aria-label={`Ver imagen ${idx + 1}`}
                            >
                                <Image
                                    src={img}
                                    alt={`Miniatura ${idx + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Información del Producto */}
            <ProductViewInfo
                userRole={userRole}
                product={product}
                variants={variantImageIndices}
                setCurrentImageIndex={setCurrentImageIndex}
            />

            {/* 👇 Panel de Zoom Flotante (solo desktop, sobre ProductViewInfo) */}
            {!isTouchDevice && (
                <ZoomOverlay
                    isZooming={isZooming}
                    zoomPosition={zoomPosition}
                    src={allImages[currentImageIndex]}
                />
            )}
        </div>
    );
}