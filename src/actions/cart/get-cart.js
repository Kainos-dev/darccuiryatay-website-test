"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";

export async function getCart() {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        const role = session?.user?.role || "minorista";

        let cart;

        // ✅ CASO 1: Usuario autenticado
        if (userId) {
            cart = await prisma.cart.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true,
                                    priceWholesale: true,
                                    coverImages: true,
                                    sku: true,
                                    stock: true,
                                    variants: true
                                }
                            }
                        }
                    }
                }
            });
        }
        // ✅ CASO 2: Usuario anónimo (invitado)
        else {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get('cart_session_id')?.value;

            if (sessionId) {
                cart = await prisma.cart.findUnique({
                    where: { sessionId },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                        priceWholesale: true,
                                        coverImages: true,
                                        sku: true,
                                        stock: true,
                                        variants: true
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // Si no hay carrito, devolver vacío
        if (!cart || cart.items.length === 0) {
            return {
                ok: true,
                cart: { items: [] },
                items: [], // Para Zustand
                total: 0
            };
        }

        // ✅ Calcular precio según rol
        const items = cart.items.map(item => {
            const price = role === "mayorista"
                ? item.product.priceWholesale
                : item.product.price;

            return {
                id: item.product.id,
                name: item.product.name,
                price: price,
                quantity: item.quantity,
                image: item.product.coverImages?.[0] || '',
                sku: item.product.sku,
                stock: item.product.stock,
                variant: item.variantColor ? {
                    color: item.variantColor,
                    hex: item.variantHex
                } : null
            };
        });

        // ✅ Calcular total
        const total = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return {
            ok: true,
            cart: {
                ...cart,
                items: items
            },
            items, // Para sincronizar con Zustand
            total
        };

    } catch (error) {
        console.error("Error al obtener carrito:", error);
        return {
            ok: false,
            message: "Error al cargar el carrito",
            cart: { items: [] },
            items: [],
            total: 0
        };
    }
}