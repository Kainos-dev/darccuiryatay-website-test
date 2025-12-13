// app/admin/locales/new/page.jsx
import LocalFormClient from "@/components/admin/locales/LocalFormClient";

export default function NewLocalPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Nuevo Local</h1>
            <LocalFormClient />
        </div>
    );
}
