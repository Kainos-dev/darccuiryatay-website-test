"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateCartItem(productId, variantHex = null, newQuantity) {
    try {
        // Cantidad mínima válida
        if (newQuantity < 1) {
            return { ok: false, message: "La cantidad debe ser al menos 1" };
        }

        // Obtener usuario
        const session = await auth();
        const userId = session?.user?.id;

        let cart;

        // Buscar carrito (autenticado)
        if (userId) {
            cart = await prisma.cart.findUnique({
                where: { userId },
                include: { items: true }
            });
        }
        // Carrito anónimo
        else {
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

        // Buscar ítem correspondiente
        const cartItem = cart.items.find(item => {
            if (variantHex) {
                return item.productId === productId && item.variantHex === variantHex;
            }
            return item.productId === productId && !item.variantHex;
        });

        if (!cartItem) {
            return { ok: false, message: "Producto no está en el carrito" };
        }

        // Validar stock
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return { ok: false, message: "Producto no encontrado" };
        }

        const availableStock = product.stock;

        if (newQuantity > availableStock) {
            return {
                ok: false,
                message: `Stock insuficiente. Disponible: ${availableStock}`
            };
        }

        // Actualizar cantidad
        await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: newQuantity }
        });

        revalidatePath("/cart");

        return {
            ok: true,
            message: "Cantidad actualizada",
            availableStock
        };

    } catch (error) {
        console.error("Error al actualizar item del carrito:", error);
        return {
            ok: false,
            message: "Error al actualizar el producto"
        };
    }
}
