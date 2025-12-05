// components/admin/AdminLayoutClient.jsx
"use client";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayoutClient({ user, children }) {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <AdminNavbar user={user} />
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}