// app/api/orders/create/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/email";

// Función para generar número de orden único
function generateOrderNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${year}-${random}`;
}

export async function POST(req) {
    try {
        const session = await auth();
        const body = await req.json();

        // Validar datos básicos
        if (!body.customer?.email || !body.items || body.items.length === 0) {
            return NextResponse.json(
                { message: "Faltan datos requeridos" },
                { status: 400 }
            );
        }

        const { customer, shippingAddress, items, subtotal, shipping, total, notes } = body;

        // Generar número de orden único
        let orderNumber = generateOrderNumber();

        // Verificar que no exista (muy improbable, pero por seguridad)
        let existingOrder = await prisma.order.findUnique({
            where: { orderNumber }
        });

        while (existingOrder) {
            orderNumber = generateOrderNumber();
            existingOrder = await prisma.order.findUnique({
                where: { orderNumber }
            });
        }

        // Crear la orden en la base de datos
        const order = await prisma.order.create({
            data: {
                orderNumber,

                // Vincular con usuario si está logueado
                userId: session?.user?.id || null,

                // Datos del cliente
                customerName: customer.name,
                customerEmail: customer.email,
                customerPhone: customer.phone || null,

                // Dirección de envío
                shippingAddress: shippingAddress,

                // Totales
                subtotal,
                shipping,
                total,

                // Notas
                notes: notes || null,

                // Fecha estimada de entrega (ajustar según tu lógica)
                estimatedDelivery: getEstimatedDelivery(),

                // Crear items de la orden
                items: {
                    create: items.map(item => ({
                        productId: item.productId,
                        productName: item.name,
                        productSku: item.sku,
                        price: item.price,
                        quantity: item.quantity,
                        variantColor: item.variant?.color || null,
                        variantHex: item.variant?.hex || null,
                        subtotal: item.price * item.quantity,
                    }))
                }
            },
            include: {
                items: true
            }
        });

        console.log("✅ Orden creada:", order.orderNumber);

        // Enviar email de confirmación
        try {
            const emailItems = order.items.map(item => ({
                name: item.productName,
                price: item.price,
                quantity: item.quantity,
                variant: item.variantColor ? {
                    color: item.variantColor,
                    hex: item.variantHex
                } : null
            }));

            await sendOrderConfirmationEmail({
                email: order.customerEmail,
                name: order.customerName,
                orderId: order.id,
                orderNumber: order.orderNumber,
                items: emailItems,
                total: order.total,
                shippingAddress: order.shippingAddress,
                estimatedDelivery: order.estimatedDelivery,
            });

            console.log("✅ Email de confirmación enviado");
        } catch (emailError) {
            console.error("❌ Error enviando email:", emailError);
            // No fallar la orden si el email falla
        }

        return NextResponse.json({
            success: true,
            message: "Orden creada exitosamente",
            orderId: order.id,
            orderNumber: order.orderNumber,
        }, { status: 201 });

    } catch (error) {
        console.error("❌ Error creando orden:", error);
        return NextResponse.json(
            { message: "Error interno del servidor", error: error.message },
            { status: 500 }
        );
    }
}

// Función helper para calcular fecha estimada
function getEstimatedDelivery() {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 7); // 7 días después

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    return deliveryDate.toLocaleDateString('es-AR', options);
}