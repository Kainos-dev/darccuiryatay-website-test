// app/admin/productos/page.jsx
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import ProductsTableClient from '@/components/admin/products/ProductsTableClient';

async function getProducts() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50 // Limitar a 50 productos por página
        });
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}


export default async function ProductosPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Productos
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {products.length} productos en total
                    </p>
                </div>

                <Link
                    href="/admin/products/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    + Agregar Producto
                </Link>
            </div>

            {/* Cliente component con filtros y tabla */}
            <ProductsTableClient products={products} />
        </div>
    );
}