// lib/products/getProductById.js
import { prisma } from "@/lib/db/prisma";

export async function getProductById(id) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                cartItems: true,   // relación válida
                // nada más puede ir aquí
            },
        });

        return product;
    } catch (err) {
        console.error("❌ Error getProductById:", err);
        return null;
    }
}


