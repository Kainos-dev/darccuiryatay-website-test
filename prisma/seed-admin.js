import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Creando usuario admin...");

    // Datos del admin
    const adminData = {
        firstName: "Admin",
        lastName: "Principal",
        email: "admin@admin.com",
        password: await bcrypt.hash("Admin0421", 10),
        phone: null,
        localidad: null,
        storeName: null,
        role: "admin",

        // 🔑 CLAVE
        emailVerified: new Date(),      // email confirmado
        verificationToken: null,
        verificationTokenExpiry: null,
    };

    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
        where: { email: adminData.email },
    });

    if (existing) {
        console.log("⚠️ El usuario admin ya existe.");
        return;
    }

    // Crear admin
    await prisma.user.create({
        data: adminData,
    });

    console.log("✅ Usuario admin creado correctamente.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
