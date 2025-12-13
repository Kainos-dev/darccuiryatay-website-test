// components/admin/locales/EliminarLocalBtn.jsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { eliminarLocal } from "@/actions/locales/locales";

export default function EliminarLocalBtn({ id }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de eliminar este local?")) return;

        startTransition(async () => {
            try {
                const res = await eliminarLocal(id);
                // eliminarLocal debe devolver { success: true } o similar
                // Si tu action no retorna, asumimos éxito si no arrojó excepción
            } catch (err) {
                // Opcional: mostrar toast/alert con error
                console.error("Error eliminando local:", err);
            } finally {
                // Fuerzo refresh del segmento para asegurar que la tabla server se vuelva a renderizar
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
            {isPending ? "Eliminando..." : "Eliminar"}
        </button>
    );
}
