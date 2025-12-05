import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { productSchema } from "@/lib/validations/products";

// GET - Obtener todos los productos
export async function GET(request) {
    try {
        const session = await auth();

        // Solo admins pueden ver esto
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Error obteniendo productos' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo producto
export async function POST(request) {
    try {
        const session = await auth();

        // Solo admins pueden crear productos
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log("body POST: ", body)

        // Validaciones básicas
        if (!body.sku || !body.name || !body.price || !body.rubro) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el SKU no exista
        const existingSKU = await prisma.product.findUnique({
            where: { sku: body.sku }
        });

        if (existingSKU) {
            return NextResponse.json(
                { error: 'El SKU ya existe' },
                { status: 400 }
            );
        }

        // Crear el producto
        const product = await prisma.product.create({
            data: {
                sku: body.sku,
                name: body.name,
                price: parseFloat(body.price),
                coverImages: body.coverImages || [],
                variants: body.variants || [],
                description: body.description || null,
                guiaTalles: body.guiaTalles || null,
                rubro: body.rubro,
                subrubros: body.subrubros || [],
                stock: body.stock || 0,
                active: body.active !== undefined ? body.active : true
            }
        });

        // Opcional: Log del cambio de precio
        /* if (body.price) {
            await prisma.priceHistory.create({
                data: {
                    productId: product.id,
                    sku: product.sku,
                    oldPrice: 0,
                    newPrice: parseFloat(body.price),
                    changedBy: session.user.email
                }
            });
        } */

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Error creando producto' },
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

        const { id } = params;
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

        const { id } = params;

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