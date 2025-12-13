// ============================================
// 1. SERVER ACTIONS - app/actions/locales.js
// ============================================
'use server'

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { getCachedSession } from "@/lib/auth/auth-cache";

// Validar que el usuario sea admin
async function validateAdmin() {
    const session = await getCachedSession();
    if (!session?.user || session.user.role !== "admin") {
        throw new Error("No autorizado");
    }
    return session.user;
}

// Crear local
export async function crearLocal(formData) {
    await validateAdmin();

    try {
        const local = await prisma.local.create({
            data: {
                nroCliente: formData.nroCliente,
                nombre: formData.nombre,
                provincia: formData.provincia,
                localidad: formData.localidad,
                ubicacion: formData.ubicacion || null,
                linkGmaps: formData.linkGmaps || null,
                redSocial: formData.redSocial || null,
                imagenUrl: formData.imagenUrl || null,
            },
        });

        // Revalidar las rutas que muestran locales
        revalidatePath("/admin/locales");
        revalidatePath("/locales"); // Ruta pública si existe

        return { success: true, data: local };
    } catch (error) {
        if (error.code === "P2002") {
            return { success: false, error: "El número de cliente ya existe" };
        }
        return { success: false, error: "Error al crear el local" };
    }
}

// Obtener todos los locales
export async function obtenerLocales() {
    try {
        const locales = await prisma.local.findMany({
            orderBy: { createdAt: "desc" },
        });
        return locales;
    } catch (error) {
        return [];
    }
}

// Actualizar local
export async function actualizarLocal(id, formData) {
    await validateAdmin();

    try {
        const local = await prisma.local.update({
            where: { id },
            data: {
                nombre: formData.nombre,
                provincia: formData.provincia,
                localidad: formData.localidad,
                ubicacion: formData.ubicacion || null,
                linkGmaps: formData.linkGmaps || null,
                redSocial: formData.redSocial || null,
                imagenUrl: formData.imagenUrl || null,
            },
        });

        revalidatePath("/admin/locales");
        revalidatePath("/locales");

        return { success: true, data: local };
    } catch (error) {
        return { success: false, error: "Error al actualizar el local" };
    }
}

// Eliminar local
export async function eliminarLocal(id) {
    await validateAdmin();

    try {
        await prisma.local.delete({
            where: { id },
        });

        revalidatePath("/admin/locales");
        revalidatePath("/locales");

        return { success: true };
    } catch (error) {
        return { success: false, error: "Error al eliminar el local" };
    }
}