'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ZoomOverlay from './ZoomOverlay';
import ProductViewInfo from './ProductViewInfo';

export default function ProductView({ product }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 👇 NUEVO: Estados para zoom
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);

    // Validación temprana
    if (!product) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <p className="text-gray-400">Producto no disponible</p>
            </div>
        );
    }

    // CLOUDINARY IMAGE LOADER
    /* const cloudinaryLoader = ({ src, width, quality }) => {
        return `https://res.cloudinary.com/ddbhwo6fn/image/upload/w_${width},q_${quality || 80}/${src}`;
    }; */

    // Memoizar cálculos costosos
    const imageData = useMemo(() => {
        const coverImages = product.coverImages || [];
        const variantsWithImages = (product.variants || []).filter(v => v.images?.length > 0);
        const hasVariantImages = variantsWithImages.length > 0;

        // Construir array de todas las imágenes
        const allImages = hasVariantImages
            ? [...coverImages, ...variantsWithImages.flatMap(v => v.images)]
            : coverImages;

        // Crear mapa de índices para cada variant
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

    // 👇 NUEVO: Handlers de zoom
    const handleZoomMove = useCallback((e) => {
        if (!imageContainerRef.current) return;

        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setZoomPosition({ x, y });
    }, []);

    const handleZoomEnter = () => setIsZooming(true);
    const handleZoomLeave = () => setIsZooming(false);


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

    // Añadir navegación por teclado
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [nextImage, prevImage]); // 👈 Añadir dependencias

    return (
        <div className="w-full min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Carrusel de imágenes - VUELVE A SU TAMAÑO ORIGINAL */}
            <div className="lg:w-1/2 w-full flex flex-col gap-4 p-4 lg:p-8 bg-gray-50">
                <div
                    onMouseEnter={handleZoomEnter}
                    onMouseLeave={handleZoomLeave}
                    className="relative flex-1" // 👈 El que controla el hover
                >
                    {/* Imagen principal CON ZOOM */}
                    <div
                        ref={imageContainerRef}
                        onMouseMove={handleZoomMove}
                        className="relative bg-white rounded-lg overflow-hidden min-h-[450px] lg:min-h-[825px] cursor-crosshair"
                    >
                        <Image
                            src={allImages[currentImageIndex]}
                            alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="w-full h-full object-contain"
                            priority={currentImageIndex === 0}
                        />

                        {/* Lupa */}
                        {isZooming && (
                            <div
                                className="absolute w-12 h-12 lg:w-32 lg:h-32 border-2 border-gray-800/50 rounded-md pointer-events-none bg-white/20 backdrop-blur-sm"
                                style={{
                                    left: `${zoomPosition.x}%`,
                                    top: `${zoomPosition.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            />
                        )}

                        {/* Prefetch */}
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

                {/* 👇 PANEL DE ZOOM FLOTANTE - Aparece SOBRE la info del producto */}
                <ZoomOverlay
                    isZooming={isZooming}
                    zoomPosition={zoomPosition}
                    src={allImages[currentImageIndex]}
                />
            </div>

            {/* Información del Producto */}
            <ProductViewInfo
                product={product}
                variants={variantImageIndices}
                setCurrentImageIndex={setCurrentImageIndex}         //para cambiar el indice de la imagen cuando se cambie de color (variante)
            />
        </div>
    );
}