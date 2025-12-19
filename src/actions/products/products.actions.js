"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Obtener producto por ID
 */
export async function getProductById(id) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            return { success: false, error: "Producto no encontrado" };
        }

        return { success: true, product };
    } catch (error) {
        console.error("Error fetching product:", error);
        return { success: false, error: "Error al cargar el producto" };
    }
}

/**
 * Actualizar producto
 */
export async function updateProduct(id, formData) {
    try {
        // Validar que el producto existe
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return { success: false, error: "Producto no encontrado" };
        }

        // Validar SKU único (si cambió)
        if (formData.sku !== existingProduct.sku) {
            const skuExists = await prisma.product.findUnique({
                where: { sku: formData.sku },
            });

            if (skuExists) {
                return { success: false, error: "El SKU ya existe en otro producto" };
            }
        }

        // Validar que los subrubros pertenecen al rubro seleccionado
        let validSubrubros = formData.subrubros || [];
        if (validSubrubros.length > 0) {
            const subrubrosCheck = await prisma.subrubro.findMany({
                where: {
                    id: { in: validSubrubros },
                    rubro: formData.rubro // ← Solo subrubros del rubro actual
                },
                select: { id: true }
            });

            // Filtrar solo los IDs válidos
            validSubrubros = subrubrosCheck.map(s => s.id);
        }

        // Actualizar producto
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                sku: formData.sku,
                name: formData.name,
                price: parseFloat(formData.price),
                priceWholesale: formData.priceWholesale
                    ? parseFloat(formData.priceWholesale)
                    : null,
                coverImages: formData.coverImages || [],
                variants: formData.variants || [],
                description: formData.description || null,
                guiaTalles: formData.guiaTalles || null,
                rubro: formData.rubro,
                subrubros: validSubrubros, // ← Usar subrubros validados
                active: formData.active ?? true,
                stock: formData.stock || "DISPONIBLE",
            },
        });

        // Revalidar las rutas afectadas
        revalidatePath("/admin/products");
        revalidatePath(`/admin/products/${id}/editar`);
        revalidatePath(`/productos/${updatedProduct.sku}`); // Si tienes vista pública

        return {
            success: true,
            message: "Producto actualizado correctamente",
            product: updatedProduct
        };
    } catch (error) {
        console.error("Error updating product:", error);
        return {
            success: false,
            error: "Error al actualizar el producto"
        };
    }
}


/**
 * Buscar productos por SKU o nombre
 */
export async function searchProducts(query) {
    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { sku: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, products };
    } catch (error) {
        console.error("Error searching products:", error);
        return { success: false, error: "Error al buscar productos" };
    }
}


/**
 * Obtiene productos marcados como "novedades" por rubro
 */
export async function getNews(rubroParam, limit = 12) {
    const newsSubrubro = await prisma.subrubro.findFirst({
        where: {
            slug: "novedades",
            rubro: rubroParam,
            active: true,
        },
        select: { id: true },
    });

    if (!newsSubrubro) return [];

    return prisma.product.findMany({
        where: {
            rubro: rubroParam,
            subrubros: {
                has: newsSubrubro.id,
            },
            active: true,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });
}

/**
 * Elimina un producto
 */
export async function deleteProduct(productId) {
    if (!productId) {
        return { success: false, error: "Product ID is required" };
    }

    try {
        await prisma.product.delete({
            where: { id: productId },
        });

        revalidatePath("/admin/products");

        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar el producto" };
    }
}
