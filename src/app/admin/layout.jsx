// app/admin/layout.jsx
import { getCachedSession } from "@/lib/auth/auth-cache";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { inter } from "../ui/fonts";

export default async function AdminLayout({ children }) {
    const session = await getCachedSession();

    if (!session?.user) {
        redirect("/auth/login");
    }

    if (session.user.role !== "admin") {
        redirect("/");
    }

    // Solo pasa los datos al cliente, no renderiza nada aquí
    return (
        <div className={`${inter.className}`}>
            <AdminLayoutClient user={session.user}>
                {children}
            </AdminLayoutClient>
        </div>
    );
}