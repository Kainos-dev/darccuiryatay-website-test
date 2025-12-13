// components/admin/AdminSidebar.jsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Usuarios", icon: "👤" },
    { href: "/admin/products", label: "Productos", icon: "🛒" },
    { href: "/admin/subrubros", label: "Subrubros", icon: "📑" },
    { href: "/admin/locales", label: "Locales", icon: "📦" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-white border-r shadow-sm p-5">
            <ul className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-2.5 rounded-lg
                                    font-medium transition-all
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                    }
                                `}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}