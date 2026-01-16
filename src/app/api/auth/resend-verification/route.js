// app/api/auth/resend-verification/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email/email";
import crypto from "crypto";

export async function POST(req) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { message: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { message: "El email ya está verificado" },
                { status: 400 }
            );
        }

        // Generar nuevo token
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: token,
                verificationTokenExpiry: expiry
            }
        });

        await sendVerificationEmail({
            email,
            name: user.firstName,
            token
        });

        return NextResponse.json(
            { message: "Email de verificación reenviado" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error reenviando email:", error);
        return NextResponse.json(
            { message: "Error al reenviar email" },
            { status: 500 }
        );
    }
}