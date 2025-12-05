"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateCartSession } from "@/lib/cart/cart-session";
import { revalidatePath } from "next/cache";

export async function addToCart(productId, quantity = 1, variantColor = null) {
    try {
        // ✅ 1. VALIDAR PRODUCTO
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return { ok: false, message: "Producto no encontrado" };
        }

        // ✅ 2. VALIDAR STOCK
        let availableStock = product.stock;
        let selectedVariant = null;

        // Si hay variante, validar stock de la variante
        /* if (variantColor && product.variants) {
            selectedVariant = product.variants.find(v => v.hex === variantColor);

            if (!selectedVariant) {
                return { ok: false, message: "Variante no encontrada" };
            }

            availableStock = selectedVariant.stock;
        } */

        if (availableStock < quantity) {
            return {
                ok: false,
                message: `Stock insuficiente. Disponible: ${availableStock}`
            };
        }

        // ✅ 3. OBTENER O CREAR CARRITO
        const session = await auth();
        const userId = session?.user?.id;
        let cart;

        if (userId) {
            cart = await prisma.cart.findUnique({
                where: { userId },
                include: { items: true }
            });

            if (!cart) {
                const newCart = await prisma.cart.create({
                    data: { userId }
                });

                cart = await prisma.cart.findUnique({
                    where: { id: newCart.id },
                    include: { items: true }
                });
            }
        } else {
            const sessionId = await getOrCreateCartSession();

            cart = await prisma.cart.findUnique({
                where: { sessionId },
                include: { items: true }
            });

            if (!cart) {
                const newCart = await prisma.cart.create({
                    data: { sessionId }
                });

                cart = await prisma.cart.findUnique({
                    where: { id: newCart.id },
                    include: { items: true }
                });
            }
        }

        const items = cart.items ?? [];

        // ✅ 4. VERIFICAR SI YA EXISTE EN EL CARRITO
        const existingItem = cart.items.find(item => {
            if (variantColor) {
                return item.productId === productId &&
                    item.variantColor === variantColor;
            }
            return item.productId === productId && !item.variantColor;
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // Validar que no exceda el stock
            if (newQuantity > availableStock) {
                return {
                    ok: false,
                    message: `No puedes agregar más. Stock máximo: ${availableStock}`
                };
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        } else {
            // ✅ 5. CREAR NUEVO ITEM
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    variantColor: variantColor || null,
                    /* variantHex: selectedVariant?.hex || null */
                    variantHex: selectedVariant?.color.hex ?? null
                }
            });
        }

        revalidatePath("/cart");
        return {
            ok: true,
            message: "Producto agregado al carrito",
            availableStock
        };

    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        return {
            ok: false,
            message: "Error al agregar producto"
        };
    }
}