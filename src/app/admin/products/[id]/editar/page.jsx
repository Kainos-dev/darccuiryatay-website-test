// app/admin/products/[id]/editar/page.jsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import ProductEditForm from "@/components/admin/products/ProductEditForm";

async function getProduct(id) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });
        return product;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

async function getSubrubros() {
    try {
        const subrubros = await prisma.subrubro.findMany({
            where: { active: true },
            include: { parent: true },
            orderBy: [
                { rubro: 'asc' },
                { order: 'asc' },
                { name: 'asc' }
            ]
        });
        return subrubros;
    } catch (error) {
        console.error("Error fetching subrubros:", error);
        return [];
    }
}

export default async function EditarProductoPage({ params }) {
    const { id } = await params;

    const [product, subrubros] = await Promise.all([
        getProduct(id),
        getSubrubros()
    ]);

    if (!product) {
        notFound();
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Editar Producto
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    SKU: {product.sku}
                </p>
            </div>

            <ProductEditForm
                product={product}
                subrubros={subrubros}
            />
        </div>
    );
}