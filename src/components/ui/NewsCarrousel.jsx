'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ProductCard from '../products/ProductCard';

export default function NewsCarrousel({ productos }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [itemsPerView, setItemsPerView] = useState(1);

    // Detectar cuántos items se muestran según el viewport
    useEffect(() => {
        const updateItemsPerView = () => {
            const width = window.innerWidth;
            if (width >= 1024) setItemsPerView(4);
            else if (width >= 640) setItemsPerView(2);
            else setItemsPerView(1);
        };

        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);
        return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);

    // Actualizar estado de botones
    const checkScroll = () => {
        if (!scrollRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        checkScroll();
        element.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            element.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    const scroll = (direction) => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const itemWidth = container.children[0]?.offsetWidth || 0;
        const gap = 16; // gap-4 = 16px
        const scrollAmount = (itemWidth + gap) * itemsPerView;

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className="relative w-full mt-50 group">
            {/* Botón izquierdo */}
            <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 
                    bg-gray-200 text-gray-800 p-3 rounded-full shadow-lg
                    hover:bg-gray-50 transition-all duration-300
                    disabled:opacity-0 disabled:pointer-events-none
                    opacity-0 group-hover:opacity-100
                    hover:scale-110 active:scale-95`}
                aria-label="Anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Contenedor del carrusel */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto scroll-smooth no-scrollbar gap-4 px-1 py-2"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {productos.map((p) => (
                    <div
                        key={p.id}
                        className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] p-4"
                    >
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>

            {/* Botón derecho */}
            <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 
                    bg-gray-200 text-gray-800 p-3 rounded-full shadow-lg
                    hover:bg-gray-50 transition-all duration-300
                    disabled:opacity-0 disabled:pointer-events-none
                    opacity-0 group-hover:opacity-100
                    hover:scale-110 active:scale-95`}
                aria-label="Siguiente"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Indicadores de scroll */}
            {productos.length > itemsPerView && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: Math.ceil(productos.length / itemsPerView) }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === 0 && canScrollLeft === false
                                ? 'w-8 bg-gray-800'
                                : 'w-2 bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

