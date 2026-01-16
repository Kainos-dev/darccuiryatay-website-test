// app/auth/reset-password/page.jsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, forgotPasswordSchema } from "@/lib/validations/auth";
import Link from "next/link";

import { inter } from "@/app/ui/fonts";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [mode, setMode] = useState(token ? "reset" : "request"); // request o reset
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Formulario para solicitar reset
    const requestForm = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    // Formulario para resetear password
    const resetForm = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: token || "",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        if (token) {
            setMode("reset");
            resetForm.setValue("token", token);
        }
    }, [token]);

    // Solicitar reset de password
    const onRequestSubmit = async (data) => {
        setIsLoading(true);
        setSuccessMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await res.json();

            if (res.ok) {
                setSuccessMessage(
                    "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña."
                );
                requestForm.reset();
            } else {
                requestForm.setError("root", {
                    message: result.message || "Error al procesar la solicitud",
                });
            }
        } catch (error) {
            requestForm.setError("root", {
                message: "Error de conexión. Intenta de nuevo.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Resetear password
    const onResetSubmit = async (data) => {
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: data.token,
                    password: data.password,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setSuccessMessage("Contraseña actualizada exitosamente. Redirigiendo al login...");
                setTimeout(() => {
                    router.push("/auth/login");
                }, 2000);
            } else {
                resetForm.setError("root", {
                    message: result.message || "Error al restablecer la contraseña",
                });
            }
        } catch (error) {
            resetForm.setError("root", {
                message: "Error de conexión. Intenta de nuevo.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-100 p-4`}>
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {mode === "request" ? "Recuperar Contraseña" : "Nueva Contraseña"}
                        </h1>
                        <p className="text-gray-600">
                            {mode === "request"
                                ? "Ingresa tu email para recibir un enlace de recuperación"
                                : "Ingresa tu nueva contraseña"}
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-800">{successMessage}</p>
                        </div>
                    )}

                    {/* Request Form */}
                    {mode === "request" && (
                        <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    {...requestForm.register("email")}
                                    disabled={isLoading}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-light-brown focus:border-transparent outline-none transition ${requestForm.formState.errors.email ? "border-red-500" : "border-gray-300"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    placeholder="tu@email.com"
                                />
                                {requestForm.formState.errors.email && (
                                    <p className="text-sm text-red-500">
                                        {requestForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            {requestForm.formState.errors.root && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">
                                        {requestForm.formState.errors.root.message}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 px-4 bg-brown hover:bg-light-brown text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar enlace de recuperación"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Reset Form */}
                    {mode === "reset" && (
                        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-sm font-medium">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        {...resetForm.register("password")}
                                        disabled={isLoading}
                                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-light-brown focus:border-transparent outline-none transition ${resetForm.formState.errors.password ? "border-red-500" : "border-gray-300"
                                            } disabled:opacity-50`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                                {resetForm.formState.errors.password && (
                                    <p className="text-sm text-red-500">
                                        {resetForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        {...resetForm.register("confirmPassword")}
                                        disabled={isLoading}
                                        className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-light-brown focus:border-transparent outline-none transition ${resetForm.formState.errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                            } disabled:opacity-50`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                                {resetForm.formState.errors.confirmPassword && (
                                    <p className="text-sm text-red-500">
                                        {resetForm.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {resetForm.formState.errors.root && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">
                                        {resetForm.formState.errors.root.message}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 px-4 bg-brown hover:bg-light-brown text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="animate-spin">⏳</span>
                                        Actualizando...
                                    </>
                                ) : (
                                    "Restablecer Contraseña"
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t text-center">
                        <Link href="/auth" className="text-sm text-brown hover:underline">
                            ← Volver al login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-brown border-t-transparent rounded-full"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}