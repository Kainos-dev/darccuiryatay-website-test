import ProductFormWithSubrubros from "@/components/admin/ProductFormWithSubrubros";
import { prisma } from "@/lib/db/prisma";

async function getSubrubros() {
    try {
        const subrubros = await prisma.subrubro.findMany({
            where: { active: true },
            include: { parent: true },
            orderBy: [
                { rubro: 'asc' },
                { order: 'asc' },
                { name: 'asc' }  // ← Si order es igual, ordena por nombre alfabéticamente
            ]
        });
        return subrubros;
    } catch (error) {
        console.error("Error fetching subrubros:", error);
        return [];
    }
}

export default async function NuevoProductoPage() {
    const subrubros = await getSubrubros();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Agregar Nuevo Producto
            </h1>
            <ProductFormWithSubrubros subrubros={subrubros} />
        </div>
    );
}