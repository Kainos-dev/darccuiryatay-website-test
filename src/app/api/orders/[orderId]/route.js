// app/api/orders/[orderId]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req, { params }) {
    try {
        const { orderId } = await params;

        if (!orderId) {
            return NextResponse.json(
                { message: "ID de orden requerido" },
                { status: 400 }
            );
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json(
                { message: "Orden no encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            order,
        });

    } catch (error) {
        console.error("Error obteniendo orden:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}