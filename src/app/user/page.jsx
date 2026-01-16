
// app/user/page.tsx
import { getCachedSession } from "@/lib/auth/auth-cache";
import { prisma } from "@/lib/db/prisma"
import UserClientPage from '@/components/users/UserClientPage';

export default async function UserPage() {
    const session = await getCachedSession();

    if (!session?.user?.id) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id
        }
    })

    if (!user) {
        return <div>Usuario no encontrado</div>
    }

    return <UserClientPage user={user} />
}
