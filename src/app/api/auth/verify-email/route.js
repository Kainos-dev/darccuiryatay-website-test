// app/api/auth/verify-email/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendWelcomeEmail } from "@/lib/email/email";

export async function POST(req) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { message: "Token es requerido" },
                { status: 400 }
            );
        }

        // Buscar usuario con este token
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: {
                    gt: new Date() // Validar expiración directamente en la query
                }
            }
        });
        if (!user) {
            return NextResponse.json(
                { message: "Token inválido o expirado" },
                { status: 400 }
            );
        }

        // Verificar si el token expiró
        if (user.verificationTokenExpiry && new Date() > user.verificationTokenExpiry) {
            return NextResponse.json(
                { message: "El token ha expirado. Por favor solicita uno nuevo." },
                { status: 400 }
            );
        }

        // Verificar si el email ya fue verificado
        if (user.emailVerified) {
            return NextResponse.json(
                { message: "Este email ya fue verificado anteriormente" },
                { status: 400 }
            );
        }

        // Actualizar usuario: marcar email como verificado y eliminar token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });

        // Enviar email de bienvenida (opcional)
        try {
            await sendWelcomeEmail({
                email: user.email,
                name: user.firstName || "Usuario",
            });
        } catch (emailError) {
            console.error("Error enviando email de bienvenida:", emailError);
            // No fallar la verificación si el email no se envía
        }

        console.log("✅ Email verificado:", user.email);

        return NextResponse.json(
            {
                message: "Email verificado exitosamente. Ya puedes iniciar sesión.",
                success: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error en verificación de email:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}