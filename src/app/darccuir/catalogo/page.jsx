// app/darccuir/catalogo/page.jsx
import { Suspense } from 'react';
import { inter, domine } from '@/app/ui/fonts';
import { getSubrubrosRecursive } from '@/lib/utils/getSubrubrosRecursive';
import { Rubro } from "@prisma/client";
import { Search } from 'lucide-react';

import InfiniteProductGrid from '@/components/products/InfiniteProductGrid';
import SubrubrosNavBar from '@/components/ui/SubrubrosNavBar';

// Revalidación cada 5 minutos
export const revalidate = 300;

// Hacer la página dinámica para que lea searchParams
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Catálogo | Darccuir',
    description: 'Descubre nuestra colección completa de productos Darccuir',
};

async function getInitialProducts(searchParams) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Construir query string con los filtros
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', '20');

    if (searchParams.subrubro) params.set('subrubro', searchParams.subrubro);
    if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams.q) params.set('q', searchParams.q);

    try {
        const res = await fetch(`${baseUrl}/api/products/darccuir?${params.toString()}`, {
            cache: 'no-store' // No cachear porque depende de filtros
        });

        if (!res.ok) throw new Error('Failed to fetch');

        return await res.json();
    } catch (error) {
        console.error('Error fetching initial products:', error);
        return { productos: [], pagination: { page: 1, hasMore: false, total: 0 } };
    }
}


// Loading component
function CatalogoSkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
            ))}
        </div>
    );
}

export default async function DarccuirCatalogo({ searchParams }) {
    const params = await searchParams;
    // ⚠️ IMPORTANTE: Agregar searchParams aquí
    const [{ productos, pagination }, subrubros] = await Promise.all([
        getInitialProducts(params),
        getSubrubrosRecursive(null, Rubro.darccuir) // ← Usar el enum
    ]);

    // Buscar el subrubro actual para mostrar su nombre
    const findSubrubro = (subs, id) => {
        for (const sub of subs) {
            if (sub.id === id) return sub;
            if (sub.children?.length) {
                const found = findSubrubro(sub.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const selectedSubrubro = params?.subrubro;
    const subrubroActual = selectedSubrubro
        ? findSubrubro(subrubros, selectedSubrubro)
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto px-4 sm:px-6 lg:px-12 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between w-full">

                    {/* Izquierda: título */}
                    <div className="flex flex-col">
                        <h1 className={`${domine.className} text-3xl sm:text-4xl font-bold text-gray-900 mb-2`}>
                            {subrubroActual ? subrubroActual.name : 'Catálogo Darccuir'}
                        </h1>
                        <p className="text-gray-600">
                            {pagination.total
                                ? `${pagination.total} producto${pagination.total !== 1 ? 's' : ''} disponible${pagination.total !== 1 ? 's' : ''}`
                                : 'Cargando...'}
                        </p>
                    </div>

                    {/* Centro: barra de búsqueda */}
                    <div className="relative flex-1 flex justify-center mr-50">
                        <div className="relative w-full max-w-md">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Search className="w-5 h-5 text-black" />
                            </span>
                            <input
                                type="text"
                                aria-label="Buscar productos"
                                placeholder="Buscar..."
                                defaultValue={params?.q || ''}
                                className="w-full pl-11 pr-4 py-2.5 
                                border-b border-gray-300 
                                focus:border-black focus:ring-0 
                                transition-all outline-none text-black"
                            />
                        </div>
                    </div>

                </div>

                <div className="relative">
                    <SubrubrosNavBar subrubros={subrubros} />
                </div>

                {/* Productos con Suspense para streaming */}
                <Suspense fallback={<CatalogoSkeleton />}>
                    <InfiniteProductGrid
                        initialProductos={productos}
                        initialPagination={pagination}
                    />
                </Suspense>
            </div>
        </div>
    );
}