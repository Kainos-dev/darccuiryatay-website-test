// components/admin/locales/LocalesTableServer.jsx
import Link from "next/link";
import EliminarLocalBtn from "../EliminarLocalBtn"; // client component

export default function LocalesTableServer({ locales = [] }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nro. Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localidad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enlaces</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                    {locales.map(local => (
                        <tr key={local.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm">{local.nroCliente}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{local.nombre}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{local.provincia}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{local.localidad}</td>

                            <td className="px-6 py-4 text-sm">
                                <div className="flex gap-3">
                                    {local.linkGmaps && (
                                        <a href={local.linkGmaps} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Maps
                                        </a>
                                    )}
                                    {local.redSocial && (
                                        <a href={local.redSocial} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            Social
                                        </a>
                                    )}
                                </div>
                            </td>

                            <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={`/admin/locales/${local.id}/edit`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        Editar
                                    </Link>

                                    <EliminarLocalBtn id={local.id} />
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
    );
}
