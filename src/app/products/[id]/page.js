// app/products/[id]/page.jsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { getSimilarProducts } from '@/lib/products/getSimilarProducts';
import ProductView from '@/components/products/ProductView';
import RelatedProductsCarousel from '@/components/products/RelatedProductsCarousel';
import Footer from '@/components/ui/Footer';

import { getCachedSession } from "@/lib/auth/auth-cache";

// Revalidación cada 10 minutos
export const revalidate = 600;

// Generar metadata dinámica
export async function generateMetadata({ params }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        select: { name: true, description: true, coverImages: true },
    });

    if (!product) {
        return {
            title: 'Producto no encontrado',
        };
    }

    return {
        title: `${product.name} | Tu Tienda`,
        description: product.description || `Compra ${product.name} al mejor precio`,
        openGraph: {
            images: product.coverImages?.[0] ? [product.coverImages[0]] : [],
        },
    };
}

// Función para obtener el producto completo
async function getProduct(id) {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            // Si necesitas incluir relaciones, hazlo aquí
        },
    });

    if (!product || !product.active) {
        return null;
    }

    return product;
}

// Loading para productos similares
function RelatedProductsSkeleton() {
    return (
        <div className="w-full bg-gray-50 py-12 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="shrink-0 w-[280px]">
                            <div className="bg-white rounded-lg overflow-hidden">
                                <div className="aspect-square bg-gray-200 animate-pulse" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function ProductPage({ params }) {
    const { id } = await params;
    const session = await getCachedSession();

    const userRole = session?.user?.role || 'minorista';

    // Obtener producto
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    // Obtener productos similares (en paralelo, no bloquea render)
    const similarProductsPromise = getSimilarProducts(product.id, product.rubro, {
        limit: 8,
        includeSubrubros: true,
        includePriceRange: true,
    });

    return (
        <main className="w-full">
            {/* Vista principal del producto */}
            <ProductView
                product={product}
                userRole={userRole}
            />

            {/* Productos similares con Suspense para streaming */}
            <Suspense fallback={<RelatedProductsSkeleton />}>
                <RelatedProductsSection
                    similarProductsPromise={similarProductsPromise}
                />
            </Suspense>

            <Footer />
        </main>
    );
}

// Server Component que resuelve la promesa
async function RelatedProductsSection({ similarProductsPromise }) {
    const similarProducts = await similarProductsPromise;

    return <RelatedProductsCarousel products={similarProducts} />;
}