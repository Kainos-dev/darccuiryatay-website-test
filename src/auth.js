// auth.js (en la raíz del proyecto)
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { mergeCarts } from "@/actions/cart/merge-carts";
import { cookies } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),

    debug: false, // ← AGREGAR ESTO - deshabilita logs excesivos

    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email y contraseña son requeridos");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error("Credenciales inválidas");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Credenciales inválidas");
                }

                return {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: user.name,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    role: user.role,
                };
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60, // IMPORTANTE: Solo actualizar cada 24 horas
    },

    callbacks: {
        //  Mergear carritos al iniciar sesión
        async signIn({ user }) {
            try {
                const cookieStore = await cookies();
                const sessionId = cookieStore.get("cart_session_id")?.value;

                if (sessionId && user.id) {
                    await mergeCarts(user.id, sessionId);
                }
            } catch (error) {
                console.error("Error al mergear carritos:", error);
                // No bloqueamos el login si falla el merge
            }

            return true;
        },

        async jwt({ token, user }) {
            // Primer login
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.firstName = user.firstName;
                token.role = user.role;
            }

            return token;
        },

        async session({ session, token }) {
            // Pasar info del token a la sesión
            if (token && session.user) {
                session.user.id = token.id;
                session.user.firstName = token.firstName;
                session.user.email = token.email;
                session.user.role = token.role;
            }

            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
});