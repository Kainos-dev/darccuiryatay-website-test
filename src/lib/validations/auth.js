// lib/validations/auth.js
import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Email inválido"),
    password: z
        .string()
        .min(1, "La contraseña es requerida"),
});

const minoristaSchema = z.object({
    role: z.literal("minorista"),

    firstName: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 35 caracteres"),
    lastName: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 35 caracteres"),
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Email inválido"),

    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z
        .string()
        .min(1, "Debes confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});


const mayoristaSchema = z.object({
    role: z.literal("mayorista"),

    firstName: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 35 caracteres"),
    lastName: z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 35 caracteres"),
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Email inválido"),

    phone: z
        .string()
        .min(7, "El teléfono es demasiado corto")
        .max(15, "El teléfono es demasiado largo")
        .regex(/^\+?[0-9]{7,15}$/, "Formato de teléfono inválido (solo números y opcional '+')"),
    storeName: z
        .string()
        .min(2, "El local debe tener al menos 2 caracteres")
        .max(100, "El local no puede exceder 100 caracteres"),
});

export const registerSchema = z.discriminatedUnion("role", [
  minoristaSchema,
  mayoristaSchema
]);

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Email inválido"),
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token inválido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
        .regex(/[a-z]/, "Debe contener al menos una minúscula")
        .regex(/[0-9]/, "Debe contener al menos un número")
        .regex(/[^A-Za-z0-9]/, "Debe contener al menos un carácter especial"),
    confirmPassword: z
        .string()
        .min(1, "Debes confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});