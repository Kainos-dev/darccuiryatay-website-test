// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

/* Mantener una sola instancia de Prisma en desarrollo para evitar
   demasiadas conexiones al hacer hot-reload. */
const globalForPrisma = global

/* Reutiliza si ya existe */
export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"], // útil en desarrollo para debug
    });

/* Solo en dev guardamos la instancia global para reusarla entre recargas */
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
