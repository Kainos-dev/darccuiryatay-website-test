import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// GET → obtener usuarios
export async function GET(request, { params }) {
    const { id: userId } = await params;
    
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        console.log("🚀 ~ GET ~ user:", user);

        if (!user) {
                return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
            }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Error obteniendo usuario" }, { status: 500 });
    }
}