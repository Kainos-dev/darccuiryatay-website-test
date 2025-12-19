// ============================================
// 1. PAGE COMPONENT - app/locales/page.jsx
// ============================================
import { obtenerLocales } from "@/actions/locales/locales";
import LocalesPublicClient from "@/components/locales/LocalesPublicClient";

import { inter, domine } from "@/app/ui/fonts";

export const metadata = {
    title: "Nuestros Locales",
    description: "Encuentra nuestros locales en todo el país",
};

export default async function LocalesPage() {
    const locales = await obtenerLocales();

    // Agrupar por provincia
    const localesPorProvincia = locales.reduce((acc, local) => {
        if (!acc[local.provincia]) {
            acc[local.provincia] = [];
        }
        acc[local.provincia].push(local);
        return acc;
    }, {});

    return (
        <div className={`${inter.className} min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className={`${domine.className} text-4xl md:text-5xl font-bold text-gray-900 mb-4`}>
                        Nuestros Locales
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Encuentra el local más cercano a tu ubicación. Estamos presentes en todo el país.
                    </p>
                    <div className="mt-6 inline-block bg-white px-6 py-3 rounded-full shadow-md">
                        <span className="text-gray-700 font-semibold">
                            {locales.length} {locales.length === 1 ? "Local" : "Locales"} disponibles
                        </span>
                    </div>
                </div>

                {/* Filtros y Vista */}
                <LocalesPublicClient
                    locales={locales}
                    localesPorProvincia={localesPorProvincia}
                />
            </div>
        </div>
    );
}
