import { prisma } from "@/lib/db/prisma";
import SubrubrosManager from "@/components/admin/SubrubrosManager";

async function getSubrubros() {
    try {
        const subrubros = await prisma.subrubro.findMany({
            include: {
                parent: true,
                children: true
            },
            orderBy: [
                { rubro: 'asc' },
                { order: 'asc' }
            ]
        });
        
        return subrubros;
    } catch (error) {
        console.error("Error fetching subrubros:", error);
        return [];
    }
}

export default async function SubrubrosPage() {
    const subrubros = await getSubrubros();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Gestión de Subrubros
            </h1>
            <SubrubrosManager initialSubrubros={subrubros} />
        </div>
    );
}