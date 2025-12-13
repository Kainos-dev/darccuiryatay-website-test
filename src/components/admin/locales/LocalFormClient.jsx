// components/admin/locales/LocalFormClient.jsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearLocal, actualizarLocal } from "@/actions/locales/locales";

export default function LocalFormClient({ initialData = null }) {
    const isEdit = !!initialData;
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        nroCliente: initialData?.nroCliente ?? "",
        nombre: initialData?.nombre ?? "",
        provincia: initialData?.provincia ?? "",
        localidad: initialData?.localidad ?? "",
        ubicacion: initialData?.ubicacion ?? "",
        linkGmaps: initialData?.linkGmaps ?? "",
        redSocial: initialData?.redSocial ?? "",
        imagenUrl: initialData?.imagenUrl ?? "",
    });

    const [error, setError] = useState(null);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            try {
                let result;
                if (isEdit) {
                    result = await actualizarLocal(initialData.id, formData);
                } else {
                    result = await crearLocal(formData);
                }

                if (result?.success) {
                    // Fuerzo refresh y redirijo al listado
                    router.push("/admin/locales");
                    router.refresh();
                } else {
                    setError(result?.error ?? "Ocurrió un error");
                }
            } catch (err) {
                console.error(err);
                setError("Error del servidor");
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Editar Local" : "Nuevo Local"}</h2>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nro. Cliente *</label>
                        <input
                            type="text"
                            required
                            disabled={isEdit}
                            value={formData.nroCliente}
                            onChange={handleChange("nroCliente")}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre *</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={handleChange("nombre")}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Provincia *</label>
                        <input
                            type="text"
                            required
                            value={formData.provincia}
                            onChange={handleChange("provincia")}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Localidad *</label>
                        <input
                            type="text"
                            required
                            value={formData.localidad}
                            onChange={handleChange("localidad")}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Ubicación</label>
                        <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={handleChange("ubicacion")}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Dirección física"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Link Google Maps</label>
                        <input
                            type="url"
                            value={formData.linkGmaps}
                            onChange={handleChange("linkGmaps")}
                            placeholder="https://maps.app.goo.gl/..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Red Social</label>
                        <input
                            type="url"
                            value={formData.redSocial}
                            onChange={handleChange("redSocial")}
                            placeholder="https://www.instagram.com/..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">URL Imagen</label>
                        <input
                            type="url"
                            value={formData.imagenUrl}
                            onChange={handleChange("imagenUrl")}
                            placeholder="https://..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isPending ? (isEdit ? "Actualizando..." : "Creando...") : isEdit ? "Actualizar" : "Crear"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            router.push("/admin/locales");
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}
