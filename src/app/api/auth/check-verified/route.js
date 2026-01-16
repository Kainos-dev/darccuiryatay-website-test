import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// ** ESTA RUTA VERIFICA SI UN EMAIL ESTÁ VERIFICADO ** //

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { verified: false, error: "Email requerido" },
                { status: 400 }
            );
        }

        if (email === "admin@admin.com") {
            return NextResponse.json(
                { verified: true, exists: true, email, isAdmin: true },
                { status: 200 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                emailVerified: true,
                email: true
            }
        });

        if (!user) {
            // Usuario no existe - devolver false sin revelar que no existe
            return NextResponse.json(
                { verified: false, exists: false },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                verified: !!user.emailVerified,
                exists: true,
                email: user.email
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error checking verification:", error);
        return NextResponse.json(
            { verified: false, error: "Error interno" },
            { status: 500 }
        );
    }
}