// app/admin/productos/page.jsx
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import DeleteProductButton from "@/components/admin/DeleteProductBtn";

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

            {/* Lista de productos */}
            {products.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="text-gray-500 mb-4">No hay productos cargados</p>
                    <Link
                        href="/admin/products/new"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Agregar primer producto
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Imagen
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    SKU
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nombre
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Precio
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Rubro
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Stock
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        {product.coverImages?.[0] ? (
                                            <img
                                                src={product.coverImages[0]}
                                                alt={product.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                Sin img
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-mono text-gray-600">
                                        {product.sku}
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                        {product.name}
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-900">
                                        ${product.price.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`
                                            px-2 py-1 text-xs rounded-full font-medium
                                            ${product.rubro === 'darccuir'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-green-100 text-green-700'
                                            }
                                        `}>
                                            {product.rubro}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-600">
                                        {product.stock || 0}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`
                                            px-2 py-1 text-xs rounded-full font-medium
                                            ${product.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }
                                        `}>
                                            {product.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/products/${product.id}/editar`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Editar
                                            </Link>

                                            {/* ← Usar el componente cliente */}
                                            <DeleteProductButton productId={product.id} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}