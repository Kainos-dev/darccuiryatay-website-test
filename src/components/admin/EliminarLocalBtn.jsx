// components/admin/EliminarLocalBtn.jsx
"use client";

import { eliminarLocal } from "@/actions/locales/locales";

export default function EliminarLocalBtn({ id }) {
    const handleDelete = async () => {
        if (!confirm("¿Seguro que querés eliminar este local?")) return;

        await eliminarLocal(id);
    };

    return (
        <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
        >
            Eliminar
        </button>
    );
}
