// app/auth/forgot-password/page.jsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import Link from "next/link";

import { inter } from "@/app/ui/fonts";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (data) => {
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
                    "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña en unos minutos."
                );
                reset();
            } else {
                setError("root", {
                    message: result.message || "Error al procesar la solicitud",
                });
            }
        } catch (error) {
            setError("root", {
                message: "Error de conexión. Por favor intenta de nuevo.",
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
                            <svg
                                className="w-8 h-8 text-brown"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            ¿Olvidaste tu contraseña?
                        </h1>
                        <p className="text-gray-600">
                            No te preocupes, ingresa tu email y te enviaremos un enlace para recuperarla
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-sm text-green-800 font-medium mb-1">
                                        ¡Email enviado!
                                    </p>
                                    <p className="text-sm text-green-700">
                                        {successMessage}
                                    </p>
                                    <p className="text-xs text-green-600 mt-2">
                                        Revisa tu bandeja de entrada y carpeta de spam.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                disabled={isLoading}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${errors.email ? "border-red-500" : "border-gray-300"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="tu@email.com"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {errors.root && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    {errors.root.message}
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
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Enviar enlace de recuperación
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info adicional */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-brown shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-black">
                                <p className="font-medium mb-1">¿Qué sucede después?</p>
                                <ul className="space-y-1">
                                    <li>• Recibirás un email con un enlace seguro</li>
                                    <li>• El enlace expirará en 1 hora</li>
                                    <li>• Podrás crear una nueva contraseña</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <span>¿Recordaste tu contraseña?</span>
                            <Link
                                href="/auth/login"
                                className="text-brown hover:underline font-medium"
                            >
                                Iniciar sesión
                            </Link>
                        </div>

                        {/* <div className="text-center">
                            <p className="text-xs text-gray-500">
                                ¿Necesitas ayuda?{" "}
                                <Link href="/support" className="text-brown hover:underline">
                                    Contacta soporte
                                </Link>
                            </p>
                        </div> */}
                    </div>
                </div>

                {/* Security note */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        🔒 Por seguridad, no revelamos si un email existe en nuestro sistema
                    </p>
                </div>
            </div>
        </div>
    );
}