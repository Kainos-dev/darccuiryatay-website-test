// app/admin/users/_actions/users.actions.js
'use server';

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Cambiar contraseña de un usuario mayorista
 */
export async function changeUserPassword(userId, newPassword) {
    try {
        // Verificar que el usuario existe y es mayorista
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        });

        if (!user) {
            return { success: false, error: "Usuario no encontrado" };
        }

        if (user.role !== 'mayorista') {
            return {
                success: false,
                error: "Solo se puede cambiar la contraseña de usuarios mayoristas"
            };
        }

        // Validar contraseña
        if (!newPassword || newPassword.length < 8) {
            return {
                success: false,
                error: "La contraseña debe tener al menos 8 caracteres"
            };
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}/password`);

        return {
            success: true,
            message: "Contraseña actualizada correctamente"
        };
    } catch (error) {
        console.error("Error changing password:", error);
        return {
            success: false,
            error: "Error al actualizar la contraseña"
        };
    }
}

/**
 * Crear nuevo usuario
 */
export async function createUser(formData) {
    try {
        // Validar email único
        const existingUser = await prisma.user.findUnique({
            where: { email: formData.email },
        });

        if (existingUser) {
            return { success: false, error: "El email ya está registrado" };
        }

        // Hash de contraseña (solo si es mayorista y se proporciona)
        let hashedPassword = null;
        if (formData.role === 'mayorista' && formData.password) {
            hashedPassword = await bcrypt.hash(formData.password, 10);
        }

        const newUser = await prisma.user.create({
            data: {
                name: formData.name,
                email: formData.email,
                password: hashedPassword,
                role: formData.role || 'minorista',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        revalidatePath("/admin/users");

        return {
            success: true,
            message: "Usuario creado correctamente",
            user: newUser
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: "Error al crear el usuario"
        };
    }
}

/**
 * Actualizar usuario
 */
export async function updateUser(userId, formData) {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return { success: false, error: "Usuario no encontrado" };
        }

        // Validar email único (si cambió)
        if (formData.email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: formData.email },
            });

            if (emailExists) {
                return { success: false, error: "El email ya está en uso" };
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${userId}/editar`);

        return {
            success: true,
            message: "Usuario actualizado correctamente",
            user: updatedUser
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: "Error al actualizar el usuario"
        };
    }
}

/**
 * Eliminar usuario
 */
export async function deleteUser(userId) {
    try {
        // No permitir eliminar al propio admin
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (user?.role === 'admin') {
            return {
                success: false,
                error: "No se puede eliminar un usuario administrador"
            };
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        revalidatePath("/admin/users");

        return {
            success: true,
            message: "Usuario eliminado correctamente"
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: "Error al eliminar el usuario"
        };
    }
}