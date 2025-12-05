// lib/auth-cache.js
import { auth } from "@/auth";
import { cache } from "react";

// Cache la función auth para evitar múltiples llamadas
export const getCachedSession = cache(async () => {
    return await auth();
});