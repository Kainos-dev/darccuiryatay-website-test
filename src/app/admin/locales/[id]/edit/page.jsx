// app/admin/locales/[id]/edit/page.jsx
import LocalFormClient from "@/components/admin/locales/LocalFormClient";
import { prisma } from "@/lib/db/prisma";

export default async function EditLocalPage({ params }) {
    const { id } = await params;

    const local = await prisma.local.findUnique({
        where: { id },
    });

    if (!local) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold">Local no encontrado</h1>
            </div>
        );
    }

    // Pasamos initialData con los campos que usa el formulario
    const initialData = {
        id: local.id,
        nroCliente: local.nroCliente,
        nombre: local.nombre,
        provincia: local.provincia,
        localidad: local.localidad,
        ubicacion: local.ubicacion ?? "",
        linkGmaps: local.linkGmaps ?? "",
        redSocial: local.redSocial ?? "",
        imagenUrl: local.imagenUrl ?? "",
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Editar Local</h1>
            {/* LocalFormClient es client component y acepta initialData */}
            <LocalFormClient initialData={initialData} />
        </div>
    );
}
