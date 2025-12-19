// components/admin/PasswordChangeForm.jsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeUserPassword } from "@/actions/users/users.actions.js";

export default function PasswordChangeForm({ user }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState({ type: '', text: '' });
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generar contraseña segura
    const generatePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
        let newPassword = "";

        // Asegurar al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
        newPassword += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        newPassword += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        newPassword += "0123456789"[Math.floor(Math.random() * 10)];
        newPassword += "!@#$%&*"[Math.floor(Math.random() * 7)];

        // Completar el resto
        for (let i = newPassword.length; i < length; i++) {
            newPassword += charset[Math.floor(Math.random() * charset.length)];
        }

        // Mezclar caracteres
        newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('');

        setPassword(newPassword);
        setShowPassword(true);
        setMessage({ type: '', text: '' });
    };

    const handleCopyPassword = async () => {
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || password.length < 8) {
            setMessage({
                type: 'error',
                text: 'La contraseña debe tener al menos 8 caracteres'
            });
            return;
        }

        setMessage({ type: '', text: '' });

        startTransition(async () => {
            const result = await changeUserPassword(user.id, password);

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Contraseña actualizada correctamente'
                });

                // Limpiar después de 2 segundos y volver
                setTimeout(() => {
                    router.push('/admin/users');
                }, 2000);
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Error al actualizar la contraseña'
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Mensajes */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Información del usuario */}
            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                    Usuario Mayorista
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                    <p><span className="font-medium">Nombre:</span> {user.firstName || 'Sin nombre'}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                </div>
            </div>

            {/* Generador de contraseña */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                </label>

                <div className="flex gap-2 mb-3">
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                    >
                        🎲 Generar Contraseña Segura
                    </button>
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa una contraseña o genera una automáticamente"
                        required
                        minLength={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        {password && (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCopyPassword}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                                    title="Copiar contraseña"
                                >
                                    {copied ? (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {password && (
                    <div className="mt-2 text-xs text-gray-500">
                        Longitud: {password.length} caracteres
                        {password.length >= 8 && (
                            <span className="text-green-600 ml-2">✓ Mínimo cumplido</span>
                        )}
                    </div>
                )}
            </div>

            {/* Instrucciones */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                    📋 Instrucciones
                </h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Genera una contraseña segura automáticamente</li>
                    <li>Copia la contraseña (botón de copiar)</li>
                    <li>Envía la contraseña al usuario mayorista por un canal seguro</li>
                    <li>Guarda los cambios</li>
                </ol>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => router.push('/admin/users')}
                    disabled={isPending}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isPending || !password}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {isPending ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                </button>
            </div>
        </form>
    );
}