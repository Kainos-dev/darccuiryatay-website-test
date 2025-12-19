import { sendVerificationEmail } from "@/lib/email/email";

export async function GET() {
    await sendVerificationEmail({
        email: "kainosarg@gmail.com",
        name: "Test User",
        token: "test-token-123",
    });

    return Response.json({ ok: true });
}
