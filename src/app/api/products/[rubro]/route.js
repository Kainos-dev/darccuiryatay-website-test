import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request, { params }) {
    try {
        const { rubro } = await params;
        console.log("🚀 ~ GET ~ rubro:", rubro)

        // Validación del rubro (según tu ENUM)
        const allowedRubros = ["darccuir", "yatay"];
        if (!allowedRubros.includes(rubro)) {
            return NextResponse.json(
                { error: "Rubro inválido" },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        const subrubroId = searchParams.get("subrubro");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const search = searchParams.get("q");

        // Filtros base del catálogo
        const where = {
            rubro,          // dinámico según la ruta
            active: true,
        };

        // Filtro por subrubro
        if (subrubroId) {
            where.subrubros = { has: subrubroId };
        }

        // Filtro por rango de precio
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice);
            if (maxPrice) where.price.lte = parseFloat(maxPrice);
        }

        // Filtro por búsqueda (nombre o SKU)
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
            ];
        }

        // Consulta principal + total simultánea
        const [productos, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    coverImages: true, // luego se corta a 2
                    variants: true,
                    stock: true,
                },
            }),

            prisma.product.count({ where }),
        ]);

        // Cortamos a 2 imágenes para hover
        const productosProcesados = productos.map((p) => ({
            ...p,
            coverImages: p.coverImages?.slice(0, 2) || [],
        }));

        return NextResponse.json(
            {
                productos: productosProcesados,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: skip + limit < total,
                },
            },
            {
                headers: {
                    "Cache-Control":
                        "public, s-maxage=300, stale-while-revalidate=600",
                },
            }
        );
    } catch (error) {
        console.error("Error fetching productos:", error);
        return NextResponse.json(
            { error: "Error al cargar productos" },
            { status: 500 }
        );
    }
}
