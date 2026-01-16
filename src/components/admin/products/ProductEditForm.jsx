// components/admin/ProductEditForm.jsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProduct, deleteProduct } from "@/actions/products/products.actions.js";
import CloudinaryGuiaTalleUploader from "./CloudinaryGuiaTalleUploader";
import CloudinaryImageUploader from "./CloudinaryImageUploader";
import ProductVariantsManager from "./ProductVariantsManager";

import { toast } from "sonner";

export default function ProductEditForm({ product, subrubros }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Estado del formulario
    const [formData, setFormData] = useState({
        sku: product.sku || '',
        name: product.name || '',
        price: product.price || '',
        priceWholesale: product.priceWholesale || '',
        description: product.description || '',
        rubro: product.rubro || 'darccuir',
        subrubros: product.subrubros || [],
        coverImages: product.coverImages || [],
        variants: product.variants || [],
        guiaTalles: product.guiaTalles || '',
        active: product.active ?? true,
        stock: product.stock || 'DISPONIBLE',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Si cambia el rubro, limpiar los subrubros
        if (name === 'rubro' && value !== formData.rubro) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                subrubros: [] // ← Limpiar subrubros al cambiar rubro
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubrubroToggle = (subrubroId) => {
        setFormData(prev => ({
            ...prev,
            subrubros: prev.subrubros.includes(subrubroId)
                ? prev.subrubros.filter(id => id !== subrubroId)
                : [...prev.subrubros, subrubroId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        startTransition(async () => {
            const result = await updateProduct(product.id, formData);


            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.message || 'Producto actualizado correctamente'
                });

                // Redirigir después de 1.5 segundos
                setTimeout(() => {
                    router.push('/admin/products');
                }, 1500);
            } else {
                setMessage({
                    type: 'error',
                    text: result.error || 'Error al actualizar el producto'
                });
            }
        });
    };

    const handleDelete = () => {
        toast.warning("Eliminar producto", {
            description: `¿Eliminar "${product.name}"?`,
            action: {
                label: "Eliminar",
                onClick: async () => {
                    setIsDeleting(true);

                    const result = await deleteProduct(product.id);

                    if (result.success) {
                        toast.success("Producto eliminado");
                        router.push("/admin/products");
                    } else {
                        toast.error(result.error);
                        setIsDeleting(false);
                    }
                },
            },
            cancel: {
                label: "Cancelar",
            },
        });
    };

    // Filtrar subrubros según el rubro seleccionado
    const filteredSubrubros = subrubros.filter(s => s.rubro === formData.rubro);

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Mensajes */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* SKU y Nombre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                    </label>
                    <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Producto *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Minorista *
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio Mayorista
                    </label>
                    <input
                        type="number"
                        name="priceWholesale"
                        value={formData.priceWholesale}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Imágenes de Portada */}
            <CloudinaryImageUploader
                images={formData.coverImages}
                onImagesChange={(newImages) => setFormData(prev => ({ ...prev, coverImages: newImages }))}
                maxFiles={5}
                label="Imágenes de Portada"
            />

            {/* Variantes de Color */}
            <ProductVariantsManager
                variants={formData.variants}
                onVariantsChange={(newVariants) => setFormData(prev => ({ ...prev, variants: newVariants }))}
            />

            {/* Guía de Talles */}
            <CloudinaryGuiaTalleUploader
                imageUrl={formData.guiaTalles}
                onImageChange={(newUrl) => setFormData(prev => ({ ...prev, guiaTalles: newUrl }))}
                label="Guía de Talles"
                folder="guias-talles"
            />

            {/* Rubro y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rubro *
                    </label>
                    <select
                        name="rubro"
                        value={formData.rubro}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="darccuir">Darccuir</option>
                        <option value="yatay">Yatay</option>
                    </select>
                    {formData.rubro !== product.rubro && (
                        <p className="text-xs text-orange-600 mt-1">
                            ⚠️ Al cambiar el rubro se limpiarán los subrubros anteriores
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado de Stock
                    </label>
                    <select
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="SIN_STOCK">Sin Stock</option>
                        <option value="CONSULTAR">Consultar</option>
                    </select>
                </div>
            </div>

            {/* Subrubros */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subrubros
                    <span className="text-xs text-gray-500 font-normal ml-2">
                        ({formData.subrubros.length} seleccionados)
                    </span>
                </label>
                {filteredSubrubros.length === 0 ? (
                    <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                        No hay subrubros disponibles para el rubro "{formData.rubro}"
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {filteredSubrubros.map((subrubro) => (
                            <label
                                key={subrubro.id}
                                className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.subrubros.includes(subrubro.id)}
                                    onChange={() => handleSubrubroToggle(subrubro.id)}
                                    className="rounded text-blue-600"
                                />
                                <span className="text-sm">{subrubro.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Estado Activo */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Producto activo (visible en la tienda)
                </label>
            </div>

            {/* Botones */}
            <div className="flex justify-between items-center pt-6 border-t">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting || isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? 'Eliminando...' : 'Eliminar Producto'}
                </button>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/products')}
                        disabled={isPending || isDeleting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isPending || isDeleting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </form>
    );
}