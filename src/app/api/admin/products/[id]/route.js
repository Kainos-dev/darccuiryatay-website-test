import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

// GET - Obtener un producto específico
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const product = await prisma.product.findUnique({
            where: { id }
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Error obteniendo producto' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar producto
export async function PUT(request, { params }) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        // Obtener producto actual para comparar precio
        const currentProduct = await prisma.product.findUnique({
            where: { id }
        });

        if (!currentProduct) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        // Actualizar producto
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                price: parseFloat(body.price),
                coverImages: body.coverImages,
                variants: body.variants,
                description: body.description,
                guiaTalles: body.guiaTalles,
                rubro: body.rubro,
                subrubros: body.subrubros,
                stock: body.stock,
                active: body.active
            }
        });

        // Log cambio de precio si hubo
        if (body.price && parseFloat(body.price) !== currentProduct.price) {
            await prisma.priceHistory.create({
                data: {
                    productId: product.id,
                    sku: product.sku,
                    oldPrice: currentProduct.price,
                    newPrice: parseFloat(body.price),
                    changedBy: session.user.email
                }
            });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Error actualizando producto' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar producto (soft delete)
export async function DELETE(request, { params }) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Soft delete: marcar como inactivo en lugar de eliminar
        const product = await prisma.product.update({
            where: { id },
            data: { active: false }
        });

        return NextResponse.json({ message: 'Producto eliminado', product });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Error eliminando producto' },
            { status: 500 }
        );
    }
}
