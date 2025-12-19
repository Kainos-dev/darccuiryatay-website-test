// app/admin/users/[id]/password/page.jsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import PasswordChangeForm from "@/components/admin/users/PasswordChangeForm";

async function getUser(id) {
    console.log("🚀 ~ getUser ~ id:", id)
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                email: true,
                role: true,
            }
        });
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export default async function ChangePasswordPage({ params }) {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
        notFound();
    }

    // Solo permitir cambiar contraseña a mayoristas
    if (user.role !== 'mayorista') {
        return (
            <div className="max-w-2xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                        Acción no permitida
                    </h2>
                    <p className="text-yellow-700">
                        Solo puedes cambiar la contraseña de usuarios mayoristas.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Cambiar Contraseña
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Usuario: <span className="font-medium">{user.name || user.email}</span>
                </p>
            </div>

            <PasswordChangeForm user={user} />
        </div>
    );
}