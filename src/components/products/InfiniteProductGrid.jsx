// components/InfiniteProductGrid.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

export default function InfiniteProductGrid({ initialProductos, initialPagination }) {
    const searchParams = useSearchParams();
    const [productos, setProductos] = useState(initialProductos);
    const [pagination, setPagination] = useState(initialPagination);
    const [loading, setLoading] = useState(false);

    const observerTarget = useRef(null);
    const abortRef = useRef(null);

    /**
     * Reset products when filters or SSR-provided data change
     */
    useEffect(() => {
        setProductos(initialProductos);
        setPagination(initialPagination);
    }, [initialProductos, initialPagination]);

    /**
     * Load more products using the current filters and pagination state
     */
    const loadMore = useCallback(async () => {
        if (loading || !pagination.hasMore) return;

        // Cancel previous pending request (edge-case)
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);

        try {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(pagination.page + 1));
            params.set('limit', String(pagination.limit));

            const res = await fetch(`/api/products/darccuir?${params.toString()}`, {
                signal: controller.signal,
            });

            if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

            const data = await res.json();

            setProductos(prev => [...prev, ...data.productos]);
            setPagination(data.pagination);
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error cargando más productos:', error);
            }
        } finally {
            setLoading(false);
        }
    }, [loading, pagination.hasMore, pagination.page, pagination.limit, searchParams]);

    /**
     * Intersection Observer for infinite scroll
     */
    useEffect(() => {
        if (!observerTarget.current) return;

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (entry.isIntersecting && pagination.hasMore && !loading) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '120px', // mejora UX cargando más anticipado
            }
        );

        observer.observe(observerTarget.current);

        return () => observer.disconnect();
    }, [loadMore, pagination.hasMore, loading]);

    return (
        <div className="w-full">    
            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {productos.map(producto => (
                    <ProductCard
                        key={producto.id || producto._id}
                        product={producto}
                    />          
                ))}
            </div>

            {/* Loader & end-of-list indicator */}
            <div ref={observerTarget} className="mt-8 flex justify-center py-10">
                {loading && (
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                        <span className="text-gray-600">Cargando más productos...</span>
                    </div>
                )}

                {!loading && !pagination.hasMore && productos.length > 0 && (
                    <p className="text-gray-500">Has visto todos los productos</p>
                )}
            </div>

            {/* Empty state */}
            {!loading && productos.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No hay productos disponibles</p>
                </div>
            )}
        </div>
    );
}
