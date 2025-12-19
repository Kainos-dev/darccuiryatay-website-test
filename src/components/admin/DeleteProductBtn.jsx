
// components/admin/DeleteProductButton.jsx
'use client';

import { deleteProduct } from "@/actions/products/products.actions.js";

export default function DeleteProductButton({ productId }) {
    const handleDelete = async (e) => {
        e.preventDefault();

        if (!confirm("¿Seguro que querés eliminar este producto?")) {
            return;
        }

        const formData = new FormData();
        formData.append("id", productId);

        await deleteProduct(formData);
    };

    return (
        <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
        >
            Eliminar
        </button>
    );
}