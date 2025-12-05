// app/api/auth/[...nextauth]/route.js
import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// IMPORTANTE: Agregar esto si no lo tienes
export const runtime = 'nodejs';