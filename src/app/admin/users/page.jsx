// app/admin/users/page.jsx
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                // No incluir password por seguridad
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export default async function UsersPage() {
    const users = await getUsers();

    // Separar usuarios por rol
    const mayoristas = users.filter(u => u.role === 'mayorista');
    const minoristas = users.filter(u => u.role === 'minorista');
    const admins = users.filter(u => u.role === 'admin');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {users.length} usuarios totales • {mayoristas.length} mayoristas • {minoristas.length} minoristas
                    </p>
                </div>

                <Link
                    href="/admin/users/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    + Agregar Usuario
                </Link>
            </div>

            {/* Tabs de filtro */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    <button className="pb-3 px-1 border-b-2 border-blue-600 text-blue-600 font-medium text-sm">
                        Todos ({users.length})
                    </button>
                    <button className="pb-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm">
                        Mayoristas ({mayoristas.length})
                    </button>
                    <button className="pb-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm">
                        Minoristas ({minoristas.length})
                    </button>
                    <button className="pb-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 text-sm">
                        Admins ({admins.length})
                    </button>
                </nav>
            </div>

            {/* Tabla de usuarios */}
            {users.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <p className="text-gray-500 mb-4">No hay usuarios registrados</p>
                    <Link
                        href="/admin/users/new"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Agregar primer usuario
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha de registro
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-medium text-sm">
                                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.firstName || 'Sin nombre'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`
                                            inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                            ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : user.role === 'mayorista'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                            }
                                        `}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/admin/users/${user.id}/editar`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Editar
                                            </Link>

                                            {user.role === 'mayorista' && (
                                                <Link
                                                    href={`/admin/users/${user.id}/password`}
                                                    className="text-orange-600 hover:text-orange-800 font-medium"
                                                >
                                                    Cambiar contraseña
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}