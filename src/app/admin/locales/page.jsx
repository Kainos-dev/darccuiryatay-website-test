// ============================================
// 2. PAGE COMPONENT - app/admin/locales/page.jsx
// ============================================
// app/admin/locales/page.jsx
import Link from "next/link";
import { obtenerLocales } from "@/actions/locales/locales";
import LocalesTableServer from "@/components/admin/locales/LocalesTableServer";

export default async function LocalesAdminPage() {
    const locales = await obtenerLocales();

    return (
        <div className="p-6 space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Locales</h1>
                    <p className="text-gray-600 mt-1">{locales.length} locales cargados</p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/locales/new"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        + Agregar Local
                    </Link>
                </div>
            </header>

            <LocalesTableServer locales={locales} />
        </div>
    );
}

