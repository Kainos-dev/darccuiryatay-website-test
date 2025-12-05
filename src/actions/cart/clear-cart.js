"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function clearCart() {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        let cart;

        // ✅ Usuario autenticado
        if (userId) {
            cart = await prisma.cart.findUnique({
                where: { userId }
            });
        }
        // ✅ Usuario anónimo
        else {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get('cart_session_id')?.value;

            if (sessionId) {
                cart = await prisma.cart.findUnique({
                    where: { sessionId }
                });
            }
        }

        if (!cart) {
            return { ok: true, message: "Carrito ya estaba vacío" };
        }

        // ✅ Eliminar todos los items del carrito
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });

        revalidatePath("/cart");

        return {
            ok: true,
            message: "Carrito vaciado correctamente"
        };

    } catch (error) {
        console.error("Error al vaciar carrito:", error);
        return {
            ok: false,
            message: "Error al vaciar el carrito"
        };
    }
}