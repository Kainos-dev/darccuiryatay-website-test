// ============================================
// 2. CLIENT COMPONENT - components/locales/LocalesPublicClient.jsx
// ============================================
'use client'

import { useState } from "react";
import { MapPin, Instagram, ExternalLink, Search, Grid3x3, List } from "lucide-react";

export default function LocalesPublicClient({ locales, localesPorProvincia }) {
    const [busqueda, setBusqueda] = useState("");
    const [provinciaFiltro, setProvinciaFiltro] = useState("todas");
    const [vistaGrid, setVistaGrid] = useState(true);

    const provincias = Object.keys(localesPorProvincia).sort();

    // Filtrar locales
    const localesFiltrados = locales.filter((local) => {
        const matchBusqueda =
            local.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            local.localidad.toLowerCase().includes(busqueda.toLowerCase()) ||
            local.provincia.toLowerCase().includes(busqueda.toLowerCase());

        const matchProvincia =
            provinciaFiltro === "todas" || local.provincia === provinciaFiltro;

        return matchBusqueda && matchProvincia;
    });

    return (
        <div>
            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o localidad..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filtro provincia */}
                    <select
                        value={provinciaFiltro}
                        onChange={(e) => setProvinciaFiltro(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="todas">Todas las provincias</option>
                        {provincias.map((provincia) => (
                            <option key={provincia} value={provincia}>
                                {provincia}
                            </option>
                        ))}
                    </select>

                    {/* Toggle vista */}
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setVistaGrid(true)}
                            className={`p-2 rounded ${vistaGrid ? "bg-white shadow" : ""}`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setVistaGrid(false)}
                            className={`p-2 rounded ${!vistaGrid ? "bg-white shadow" : ""}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contador de resultados */}
                <div className="mt-4 text-sm text-gray-600">
                    Mostrando {localesFiltrados.length} de {locales.length} locales
                </div>
            </div>

            {/* Grid o Lista de locales */}
            {vistaGrid ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localesFiltrados.map((local) => (
                        <LocalCard key={local.id} local={local} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {localesFiltrados.map((local) => (
                        <LocalListItem key={local.id} local={local} />
                    ))}
                </div>
            )}

            {/* Sin resultados */}
            {localesFiltrados.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <div className="text-gray-400 mb-4">
                        <MapPin className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No se encontraron locales
                    </h3>
                    <p className="text-gray-500">
                        Intenta ajustar los filtros de búsqueda
                    </p>
                </div>
            )}
        </div>
    );
}

// Componente de tarjeta para vista grid
function LocalCard({ local }) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            {/* Imagen o placeholder */}
            <div className="relative h-48 bg-linear-to-br from-gray-200 to-gray-300">
                {local.imagenUrl ? (
                    <img
                        src={local.imagenUrl}
                        alt={local.nombre}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center p-6">
                            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 font-medium">Sin imagen disponible</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{local.nombre}</h3>

                <div className="space-y-2 mb-4">
                    <div className="flex items-start text-gray-600">
                        <MapPin className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">{local.localidad}, {local.provincia}</p>
                            {local.ubicacion && (
                                <p className="text-sm text-gray-500">{local.ubicacion}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enlaces */}
                <div className="flex gap-2 pt-4 border-t">
                    {local.linkGmaps && (
                        <a
                            href={local.linkGmaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-brown text-white px-4 py-2 rounded-lg hover:bg-light-brown transition text-sm font-medium"
                        >
                            <MapPin className="w-4 h-4" />
                            Ver Mapa
                        </a>
                    )}
                    {local.redSocial && (
                        <a
                            href={local.redSocial}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                        >
                            <Instagram className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

// Componente para vista lista
function LocalListItem({ local }) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row">
                {/* Imagen */}
                <div className="md:w-64 h-48 md:h-auto bg-linear-to-br from-gray-200 to-gray-300 shrink-0">
                    {local.imagenUrl ? (
                        <img
                            src={local.imagenUrl}
                            alt={local.nombre}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-6">
                                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500 font-medium">Sin imagen</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenido */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{local.nombre}</h3>

                        <div className="flex items-start text-gray-600 mb-2">
                            <MapPin className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium">{local.localidad}, {local.provincia}</p>
                                {local.ubicacion && (
                                    <p className="text-sm text-gray-500 mt-1">{local.ubicacion}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        {local.linkGmaps && (
                            <a
                                href={local.linkGmaps}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                <MapPin className="w-4 h-4" />
                                Ver en Mapa
                            </a>
                        )}
                        {local.redSocial && (
                            <a
                                href={local.redSocial}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-medium"
                            >
                                <Instagram className="w-4 h-4" />
                                Instagram
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}