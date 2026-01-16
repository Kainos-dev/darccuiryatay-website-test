"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    // ✅ Usar ref para evitar doble ejecución
    const hasVerified = useRef(false);

    useEffect(() => {
        // ✅ Solo verificar si hay token Y no se ha verificado antes
        if (token && !hasVerified.current) {
            hasVerified.current = true;
            verifyEmail(token);
        } else if (!email && !token) {
            setStatus("error");
            setMessage("Token de verificación no encontrado");
        }
    }, [token, email]);

    // Cooldown timer para reenviar email
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const verifyEmail = async (verificationToken) => {
        try {
            const res = await fetch("/api/auth/verify-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: verificationToken }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "Email verificado exitosamente");

                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    router.push("/auth/login?verified=true");
                }, 3000);
            } else {
                setStatus("error");
                setMessage(data.message || "Error al verificar el email");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Error de conexión. Por favor intenta de nuevo.");
        }
    };

    const handleResendEmail = async () => {
        if (resendCooldown > 0 || !email) return;

        setResendCooldown(60);

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Email de verificación reenviado. Revisa tu bandeja de entrada.");
            } else {
                setMessage(data.message || "Error al reenviar el email");
                setResendCooldown(0);
            }
        } catch (error) {
            setMessage("Error de conexión. Por favor intenta de nuevo.");
            setResendCooldown(0);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Icono y estado */}
                    <div className="text-center mb-6">
                        {status === "verifying" && (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 relative">
                                    <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Verificando tu email...
                                </h1>
                                <p className="text-gray-600">
                                    Por favor espera un momento
                                </p>
                            </>
                        )}

                        {status === "success" && (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    ¡Email verificado!
                                </h1>
                                <p className="text-gray-600">
                                    {message}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Serás redirigido al login en unos segundos...
                                </p>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    Error de verificación
                                </h1>
                                <p className="text-gray-600">
                                    {message}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Mensaje adicional para cuando no hay token */}
                    {!token && email && status !== "success" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800 mb-3">
                                Te hemos enviado un email a <strong>{email}</strong> con un enlace de verificación.
                            </p>
                            <p className="text-xs text-blue-700">
                                Si no lo encuentras, revisa tu carpeta de spam.
                            </p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="space-y-3 mt-6">
                        {status === "success" && (
                            <Link
                                href="/auth/login"
                                className="w-full block text-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                            >
                                Ir al Login
                            </Link>
                        )}

                        {status === "error" && email && (
                            <button
                                onClick={handleResendEmail}
                                disabled={resendCooldown > 0}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                            >
                                {resendCooldown > 0
                                    ? `Reenviar en ${resendCooldown}s`
                                    : "Reenviar email de verificación"}
                            </button>
                        )}

                        {status === "error" && (
                            <Link
                                href="/auth/login"
                                className="w-full block text-center py-2.5 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition"
                            >
                                Volver al login
                            </Link>
                        )}
                    </div>

                    {/* Ayuda */}
                    <div className="mt-6 pt-6 border-t text-center">
                        <p className="text-sm text-gray-600">
                            ¿Problemas para verificar?{" "}
                            <Link href="/support" className="text-blue-600 hover:underline">
                                Contacta soporte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}