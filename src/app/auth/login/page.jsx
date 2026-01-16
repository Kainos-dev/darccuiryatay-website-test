// components/auth/LoginForm.jsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import { toast } from "sonner";

import { inter, domine } from "@/app/ui/fonts";

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setError,
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendVerification = async (email) => {
        if (!email || resendCooldown > 0) return;

        setResendCooldown(60);

        try {
            const res = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Email de verificación reenviado. Revisa tu bandeja de entrada.");
            } else {
                toast.error(data.message || "Error al reenviar email");
                setResendCooldown(0);
            }
        } catch (error) {
            toast.error("Error de conexión");
            setResendCooldown(0);
        }
    };

    const onSubmit = async (data) => {
        setIsLoading(true);

        try {
            // ✅ PASO 1: Verificar si el email está verificado ANTES de intentar login
            const checkRes = await fetch("/api/auth/check-verified", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });

            const checkData = await checkRes.json();

            console.log("🔍 Verificación de email:", checkData);

            // Si el usuario existe pero no está verificado
            if (checkData.exists && !checkData.verified) {
                setError("root", {
                    message: "Por favor verifica tu email antes de iniciar sesión. Revisa tu bandeja de entrada.",
                    type: "verification"
                });
                toast.error("Email no verificado");
                setIsLoading(false);
                return; // ⚠️ Detener aquí, no intentar login
            }

            // ✅ PASO 2: Si está verificado (o no existe), proceder con login normal
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            console.log("🔍 Respuesta de signIn:", res);

            if (res?.error) {
                setError("root", {
                    message: "Email o contraseña incorrectos",
                    type: "credentials"
                });
                toast.error("Credenciales inválidas");
            } else if (res?.ok) {
                toast.success("Inicio de sesión exitoso");
                window.location.href = "/admin";
            }

        } catch (error) {
            console.error("❌ Error en login:", error);
            setError("root", {
                message: "Error de conexión. Verifica tu internet.",
                type: "connection"
            });
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${inter.className} min-h-screen flex items-center justify-center bg-gray-100 px-4`}>
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 sm:p-10 space-y-6 border border-gray-200">

                <div className="text-center space-y-2">
                    <h2 className={`${domine.className} text-3xl font-bold text-gray-800`}>Iniciar Sesión</h2>
                    <p className="text-gray-500 text-sm">Accede a tu cuenta para continuar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-black text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            disabled={isLoading}
                            className={`text-black w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-light-brown focus:border-light-brown outline-none transition
                            ${errors.email ? "border-red-500" : "border-gray-300"}
                            disabled:opacity-50 disabled:cursor-not-allowed`}
                            placeholder="tu@email.com"
                        />
                        {errors.email && (
                            <p className="text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-black text-sm font-medium">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                {...register("password")}
                                disabled={isLoading}
                                className={`text-black w-full px-4 py-2 pr-12 border rounded-lg shadow-sm focus:ring-2 focus:ring-light-brown focus:border-light-brown outline-none transition
                                ${errors.password ? "border-red-500" : "border-gray-300"}
                                disabled:opacity-50 disabled:cursor-not-allowed`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                                disabled={isLoading}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Error general */}
                    {errors.root && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800">
                                {errors.root.message}
                            </p>

                            {/* ✅ Botón de reenvío solo si es error de verificación */}
                            {errors.root.type === "verification" && (
                                <button
                                    type="button"
                                    onClick={() => handleResendVerification(watch("email"))}
                                    disabled={resendCooldown > 0}
                                    className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    {resendCooldown > 0
                                        ? `Reenviar en ${resendCooldown}s`
                                        : "Reenviar email de verificación"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 text-md cursor-pointer bg-brown hover:bg-light-brown text-white font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                Iniciando sesión...
                            </>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>

                {/* Links */}
                <div className="text-center space-y-2">
                    <Link
                        href="/auth/forgot-password"
                        className="text-sm text-brown hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                    <br />
                    <Link
                        href="/auth/register"
                        className="text-sm text-gray-700 hover:underline"
                    >
                        ¿No tienes una cuenta? Regístrate
                    </Link>
                </div>

            </div>
        </div>
    );

}