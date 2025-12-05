"use server";

import { prisma } from "@/lib/db/prisma";

export async function getNews(rubroParam, limit = 12) {
    // Buscar el subrubro “novedades” correspondiente al rubro
    const news = await prisma.subrubro.findFirst({
        where: {
            slug: "novedades",
            rubro: rubroParam,
            active: true
        }
    });

    // Si no existe ese subrubro → devolver vacío
    if (!news) return [];

    // Buscar productos que tengan ese ID en el array "subrubros"
    const productos = await prisma.product.findMany({
        where: {
            rubro: rubroParam,
            subrubros: {
                has: news.id
            },
            active: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: limit
    });

    return productos;
}

