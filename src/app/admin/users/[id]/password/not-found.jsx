// app/admin/users/[id]/password/not-found.jsx
import Link from "next/link";

export default function UserNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-6">
                <div className="text-6xl mb-4">👤</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Usuario no encontrado
                </h1>
                <p className="text-gray-600 mb-6">
                    El usuario que buscas no existe o fue eliminado
                </p>
            </div>

            <Link
                href="/admin/users"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Volver a Usuarios
            </Link>
        </div>
    );
}