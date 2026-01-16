// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email/email";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(req) {
    try {
        const body = await req.json();

        // Validar con Zod
        const validatedData = forgotPasswordSchema.parse(body);

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        // Por seguridad, siempre retornamos el mismo mensaje
        // incluso si el usuario no existe (previene email enumeration)
        const successMessage =
            "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.";

        if (!user) {
            console.log("⚠️ Intento de reset para email no registrado:", validatedData.email);
            // Esperar un poco para evitar timing attacks
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json(
                { message: successMessage },
                { status: 200 }
            );
        }

        // No permitir reset si es usuario OAuth sin password
        if (!user.password) {
            console.log("⚠️ Usuario OAuth intentó reset:", user.email);
            return NextResponse.json(
                { message: successMessage },
                { status: 200 }
            );
        }

        // Generar token de reset
        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        // Guardar token en la base de datos
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // Enviar email con el link de reset
        try {
            await sendPasswordResetEmail({
                email: user.email,
                name: user.name || "Usuario",
                token: resetToken,
            });

            console.log("✅ Email de reset enviado a:", user.email);
        } catch (emailError) {
            console.error("Error enviando email de reset:", emailError);

            // Limpiar el token si falló el envío
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });

            return NextResponse.json(
                { message: "Error al enviar el email. Intenta de nuevo." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: successMessage },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error en forgot-password:", error);

        if (error.name === "ZodError") {
            return NextResponse.json(
                { message: "Email inválido", errors: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}