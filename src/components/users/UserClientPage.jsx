'use client';
import { useState } from 'react';
import Link from 'next/link';
import { inter, domine } from '@/app/ui/fonts';

export default function UserClientPage({ user }) {

    // Badge de rol
    const getRoleBadge = (role) => {
        const roles = {
            mayorista: { label: 'Mayorista', color: 'bg-purple-100 text-purple-800' },
            admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
            cliente: { label: 'Cliente', color: 'bg-blue-100 text-blue-800' },
        };
        return roles[role] || roles.cliente;
    };

    const roleBadge = getRoleBadge(user.role);

    // Estado de verificación de email
    const isEmailVerified = user.emailVerified !== null;

    return (
        <div className={`${inter.className} max-w-4xl mx-auto p-6 space-y-6`}>
            {/* Header con Avatar y Nombre */}
            <div className="bg-brown rounded-xl p-8 text-white">
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-4xl font-bold">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>

                    {/* Info Principal */}
                    <div className="flex-1">
                        <h1 className={`${domine.className} text-3xl font-bold mb-2`}>
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-blue-100 mb-3">{user.email}</p>

                        <div className="flex items-center gap-3">
                            {/* Badge de Rol */}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
                                {roleBadge.label}
                            </span>

                            {/* Badge de Verificación */}
                            {isEmailVerified ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verificado
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Sin verificar
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Información Personal */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Información Personal
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-lg text-gray-900 mt-1">{user.firstName}</p>
                    </div>

                    {/* Apellido */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Apellido</label>
                        <p className="text-lg text-gray-900 mt-1">{user.lastName}</p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-lg text-gray-900 mt-1">{user.email}</p>
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="text-lg text-gray-900 mt-1">
                            {user.phone || <span className="text-gray-400 italic">No especificado</span>}
                        </p>
                    </div>

                    {/* Localidad */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Localidad</label>
                        <p className="text-lg text-gray-900 mt-1">
                            {user.localidad || <span className="text-gray-400 italic">No especificada</span>}
                        </p>
                    </div>

                    {/* Nombre de Tienda (solo para mayoristas) */}
                    {user.role === 'mayorista' && user.storeName && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Nombre de Tienda</label>
                            <p className="text-lg text-gray-900 mt-1 font-medium">{user.storeName}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Información de Cuenta */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Información de Cuenta
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID de Usuario */}
                    {/* <div>
                        <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
                        <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded border">
                            {user.id}
                        </p>
                    </div> */}

                    {/* Tipo de Cuenta */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Tipo de Cuenta</label>
                        <p className="text-lg text-gray-900 mt-1">{roleBadge.label}</p>
                    </div>

                    {/* Miembro desde */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Miembro desde</label>
                        <p className="text-lg text-gray-900 mt-1">
                            {new Date(user.createdAt).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>

                    {/* Última actualización */}
                    <div>
                        <label className="text-sm font-medium text-gray-500">Última actualización</label>
                        <p className="text-lg text-gray-900 mt-1">
                            {new Date(user.updatedAt).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Acciones */}
            <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Acciones
                </h2>

                <div className="flex flex-wrap gap-3">
                    {!isEmailVerified && (
                        <button className="px-4 py-2 bg-brown text-white rounded-lg hover:bg-light-brown transition flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Verificar Email
                        </button>
                    )}

                    {/* <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Cambiar Contraseña
                    </button> */}

                    <Link
                        href="/"
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                    >
                        Volver a Inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}