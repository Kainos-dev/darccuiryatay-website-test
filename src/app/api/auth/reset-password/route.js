// app/api/auth/reset-password/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

export async function POST(req) {
    try {
        const body = await req.json();
        const { token, password } = body;

        // Validación básica
        if (!token || !password) {
            return NextResponse.json(
                { message: "Token y contraseña son requeridos" },
                { status: 400 }
            );
        }

        // Validar longitud mínima de password
        if (password.length < 8) {
            return NextResponse.json(
                { message: "La contraseña debe tener al menos 8 caracteres" },
                { status: 400 }
            );
        }

        // Buscar usuario con este token
        const user = await prisma.user.findFirst({
            where: { resetToken: token }
        });

        if (!user) {
            return NextResponse.json(
                {
                    message: "Token inválido o expirado. Por favor solicita un nuevo enlace.",
                    code: "INVALID_TOKEN"
                },
                { status: 400 }
            );
        }

        // Verificar si el token expiró (1 hora)
        if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
            // Limpiar el token expirado
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken: null,
                    resetTokenExpiry: null,
                },
            });

            return NextResponse.json(
                {
                    message: "El token ha expirado. Por favor solicita un nuevo enlace de recuperación.",
                    code: "TOKEN_EXPIRED"
                },
                { status: 400 }
            );
        }

        // Verificar que el usuario tenga password (no sea OAuth)
        if (!user.password) {
            return NextResponse.json(
                {
                    message: "Esta cuenta usa login social (Google/GitHub). No puedes restablecer la contraseña.",
                    code: "OAUTH_ACCOUNT"
                },
                { status: 400 }
            );
        }

        // Verificar que la nueva contraseña sea diferente a la anterior (opcional pero recomendado)
        const isSamePassword = await bcrypt.compare(password, user.password);

        if (isSamePassword) {
            return NextResponse.json(
                {
                    message: "La nueva contraseña debe ser diferente a la anterior",
                    code: "SAME_PASSWORD"
                },
                { status: 400 }
            );
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Actualizar contraseña y limpiar tokens de reset
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        console.log("✅ Contraseña actualizada para:", user.email);

        // Opcional: Enviar email de notificación de cambio de contraseña
        // await sendPasswordChangedNotificationEmail({ 
        //   email: user.email, 
        //   name: `${user.firstName} ${user.lastName}` 
        // });

        return NextResponse.json(
            {
                message: "Contraseña actualizada exitosamente",
                success: true,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ Error en reset-password:", error);

        return NextResponse.json(
            {
                message: "Error interno del servidor. Por favor intenta de nuevo.",
                code: "INTERNAL_ERROR"
            },
            { status: 500 }
        );
    }
}