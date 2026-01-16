import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { sendVerificationEmail } from "@/lib/email/email";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const body = await req.json();

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            storeName,
            localidad,
            role,
        } = body;

        // 1. verificar si existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: "El usuario ya existe" },
                { status: 400 }
            );
        }

        // 2. construir objeto según role
        let userData = {
            firstName,
            lastName,
            email,
            role,
        };

        // MINORISTA → requiere password
        if (role === "minorista") {
            if (!password) {
                return NextResponse.json(
                    { success: false, error: "La contraseña es obligatoria" },
                    { status: 400 }
                );
            }

            const hash = await bcrypt.hash(password, 10);
            userData.password = hash;
            userData.phone = null;
            userData.storeName = null;
            userData.localidad = null;
        }

        // MAYORISTA → NO usa password
        if (role === "mayorista") {
            userData.password = "";
            userData.phone = phone ?? null;
            userData.storeName = storeName ?? null;
            userData.localidad = localidad ?? null;
        }

        // 3. GENERAR TOKEN Y EXPIRACIÓN (solo si NO es admin)
        if (email !== "admin@admin.com") {
            const token = crypto.randomBytes(32).toString("hex");
            const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

            userData.verificationToken = token;
            userData.verificationTokenExpiry = expiry;
            userData.emailVerified = null;
        } else {
            // ✅ Admin se marca como verificado automáticamente
            userData.verificationToken = null;
            userData.verificationTokenExpiry = null;
            userData.emailVerified = new Date(); // Ya verificado
        }

        // 4. Crear usuario CON carrito vacío en una sola transacción
        const user = await prisma.user.create({
            data: {
                ...userData,
            },
        });

        // ✨ 5. Mergear carrito anónimo si existe
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("cart_session_id")?.value;

        console.log("🍪 SessionId de cookie:", sessionId);

        if (sessionId) {
            // Hay carrito anónimo → mergearlo
            console.log("🔀 Mergeando carrito anónimo...");
            const { mergeCarts } = await import("@/actions/cart/merge-carts");
            const result = await mergeCarts(user.id, sessionId);
            console.log("✅ Resultado merge:", result);
        } else {
            // NO hay carrito anónimo → crear uno vacío
            console.log("🆕 Creando carrito vacío...");
            await prisma.cart.create({
                data: { userId: user.id }
            });
        }

        // 6. Enviar el email con el token (solo si NO es admin)
        if (email !== "admin@admin.com") {
            await sendVerificationEmail({
                email,
                name: userData.firstName,
                token
            });

            return NextResponse.json(
                { success: true, message: "Usuario registrado. Verifica tu email." },
                { status: 201 }
            );
        } else {
            return NextResponse.json(
                { success: true, message: "Cuenta de administrador creada exitosamente." },
                { status: 201 }
            );
        }

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return NextResponse.json(
            { success: false, error: "Error al registrar usuario" },
            { status: 500 }
        );
    }
}
