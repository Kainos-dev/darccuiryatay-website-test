import { cookies } from "next/headers";
import { randomBytes } from "crypto";

const CART_SESSION_COOKIE = "cart_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

export async function getOrCreateCartSession() {
    const cookieStore = await cookies();
    let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

    if (!sessionId) {
        sessionId = randomBytes(32).toString("hex");
        cookieStore.set(CART_SESSION_COOKIE, sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: COOKIE_MAX_AGE,
            path: "/"
        });
    }

    return sessionId;
}

export async function clearCartSession() {
    const cookieStore = await cookies();
    cookieStore.delete(CART_SESSION_COOKIE);
}