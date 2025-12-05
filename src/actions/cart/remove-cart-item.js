"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function removeCartItem(productId, variantHex = null) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        let cart;

        // Obtener carrito con items
        if (userId) {
            cart = await prisma.cart.findUnique({
                where: { userId },
                include: { items: true }
            });
        } else {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get("cart_session_id")?.value;

            if (sessionId) {
                cart = await prisma.cart.findUnique({
                    where: { sessionId },
                    include: { items: true }
                });
            }
        }

        if (!cart) {
            return { ok: false, message: "Carrito no encontrado" };
        }

        // Encontrar item
        const cartItem = cart.items.find(item => {
            if (variantHex) {
                return item.productId === productId && item.variantHex === variantHex;
            }

            // Sin variantes
            return item.productId === productId && !item.variantHex;
        });

        if (!cartItem) {
            return { ok: false, message: "Ese producto no está en tu carrito" };
        }

        // Eliminar item
        await prisma.cartItem.delete({
            where: { id: cartItem.id }
        });

        revalidatePath("/cart");

        return {
            ok: true,
            message: "Producto eliminado correctamente"
        };

    } catch (error) {
        console.error("Error al eliminar item del carrito:", error);
        return {
            ok: false,
            message: "Error al eliminar el producto"
        };
    }
}
