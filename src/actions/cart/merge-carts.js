"use server";

import { prisma } from "@/lib/db/prisma";
import { clearCartSession } from "@/lib/cart/cart-session";

export async function mergeCarts(userId, sessionId) {
    try {
        // Buscar carrito anónimo
        const anonymousCart = await prisma.cart.findUnique({
            where: { sessionId },
            include: { items: true }
        });

        if (!anonymousCart || anonymousCart.items.length === 0) {
            await clearCartSession();
            return { ok: true };
        }

        // Buscar o crear carrito del usuario
        let userCart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true }
        });

        if (!userCart) {
            // Convertir el carrito anónimo en carrito de usuario
            await prisma.cart.update({
                where: { id: anonymousCart.id },
                data: {
                    userId,
                    sessionId: null
                }
            });
        } else {
            // Mergear items
            for (const item of anonymousCart.items) {
                const existingItem = userCart.items.find(
                    i => i.productId === item.productId
                );

                if (existingItem) {
                    // Sumar cantidades
                    await prisma.cartItem.update({
                        where: { id: existingItem.id },
                        data: {
                            quantity: existingItem.quantity + item.quantity
                        }
                    });
                } else {
                    // Mover item al carrito del usuario
                    await prisma.cartItem.update({
                        where: { id: item.id },
                        data: { cartId: userCart.id }
                    });
                }
            }

            // Eliminar carrito anónimo
            await prisma.cart.delete({
                where: { id: anonymousCart.id }
            });
        }

        await clearCartSession();
        return { ok: true };

    } catch (error) {
        console.error("Error al mergear carritos:", error);
        return { ok: false };
    }
}