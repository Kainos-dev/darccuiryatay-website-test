// ============================================
// 3. CLIENT COMPONENT - components/admin/LocalesAdminClient.jsx
// ============================================
'use client'

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearLocal, actualizarLocal, eliminarLocal } from "@/actions/locales/locales.js";

export default function LocalesAdminClient({ localesIniciales }) {
    const [locales, setLocales] = useState(localesIniciales);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        nroCliente: "",
        nombre: "",
        provincia: "",
        localidad: "",
        ubicacion: "",
        linkGmaps: "",
        redSocial: "",
        imagenUrl: "",
    });

    const resetForm = () => {
        setFormData({
            nroCliente: "",
            nombre: "",
            provincia: "",
            localidad: "",
            ubicacion: "",
            linkGmaps: "",
            redSocial: "",
            imagenUrl: "",
        });
        setEditando(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = editando
                ? await actualizarLocal(editando.id, formData)
                : await crearLocal(formData);

            if (result.success) {
                setMostrarForm(false);
                resetForm();
                router.refresh();
            } else {
                setError(result.error);
            }
        });
    };

    const handleEditar = (local) => {
        setEditando(local);
        setFormData({
            nroCliente: local.nroCliente,
            nombre: local.nombre,
            provincia: local.provincia,
            localidad: local.localidad,
            ubicacion: local.ubicacion || "",
            linkGmaps: local.linkGmaps || "",
            redSocial: local.redSocial || "",
            imagenUrl: local.imagenUrl || "",
        });
        setMostrarForm(true);
    };

    const handleEliminar = async (id) => {
        if (!confirm("¿Estás seguro de eliminar este local?")) return;

        startTransition(async () => {
            const res = await eliminarLocal(id);
            if (res.success) {
                router.refresh();   // <--- recarga los datos del server
            }
        });
    };

    return (
        <div>
            {/* Botón para mostrar formulario */}
            {!mostrarForm && (
                <button
                    onClick={() => setMostrarForm(true)}
                    className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Agregar Local
                </button>
            )}

            {/* Formulario */}
            {mostrarForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-bold mb-4">
                        {editando ? "Editar Local" : "Nuevo Local"}
                    </h2>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nro. Cliente *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nroCliente}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nroCliente: e.target.value })
                                    }
                                    disabled={!!editando}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nombre del Local *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Provincia *
                                </label>
                                <input
                                    type="text"
                                    value={formData.provincia}
                                    onChange={(e) =>
                                        setFormData({ ...formData, provincia: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Localidad *
                                </label>
                                <input
                                    type="text"
                                    value={formData.localidad}
                                    onChange={(e) =>
                                        setFormData({ ...formData, localidad: e.target.value })
                                    }
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Ubicación
                                </label>
                                <input
                                    type="text"
                                    value={formData.ubicacion}
                                    onChange={(e) =>
                                        setFormData({ ...formData, ubicacion: e.target.value })
                                    }
                                    placeholder="Dirección física"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Link Google Maps
                                </label>
                                <input
                                    type="url"
                                    value={formData.linkGmaps}
                                    onChange={(e) =>
                                        setFormData({ ...formData, linkGmaps: e.target.value })
                                    }
                                    placeholder="https://maps.app.goo.gl/..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Red Social
                                </label>
                                <input
                                    type="url"
                                    value={formData.redSocial}
                                    onChange={(e) =>
                                        setFormData({ ...formData, redSocial: e.target.value })
                                    }
                                    placeholder="https://www.instagram.com/..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    URL Imagen
                                </label>
                                <input
                                    type="url"
                                    value={formData.imagenUrl}
                                    onChange={(e) =>
                                        setFormData({ ...formData, imagenUrl: e.target.value })
                                    }
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isPending ? "Guardando..." : editando ? "Actualizar" : "Crear"}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMostrarForm(false);
                                    resetForm();
                                }}
                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tabla de locales */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nro. Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Ubicación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Enlaces
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {locales.map((local) => (
                            <tr key={local.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{local.nroCliente}</td>
                                <td className="px-6 py-4 text-sm font-medium">{local.nombre}</td>
                                <td className="px-6 py-4 text-sm">
                                    {local.provincia}, {local.localidad}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-2">
                                        {local.linkGmaps && (
                                            <a
                                                href={local.linkGmaps}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Maps
                                            </a>
                                        )}
                                        {local.redSocial && (
                                            <a
                                                href={local.redSocial}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                Social
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditar(local)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleEliminar(local.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {locales.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No hay locales registrados
                    </div>
                )}
            </div>
        </div>
    );
}