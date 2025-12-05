'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductFormWithSubrubros({ subrubros: initialSubrubros }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: '',
        description: '',
        rubro: 'darccuir',
        stock: 0,
        active: true,
        coverImages: [],
        variants: [],
        guiaTalles: '',
        subrubros: [] // Array de IDs
    });

    const [currentVariant, setCurrentVariant] = useState({
        color: { name: '', hex: '#000000' },
        images: []
    });

    // Filtrar subrubros según el rubro seleccionado
    const [availableSubrubros, setAvailableSubrubros] = useState([]);

    useEffect(() => {
        const filtered = initialSubrubros.filter(s => s.rubro === formData.rubro);
        setAvailableSubrubros(filtered);
        // Limpiar subrubros seleccionados al cambiar de rubro
        setFormData(prev => ({ ...prev, subrubros: [] }));
    }, [formData.rubro, initialSubrubros]);

    // Upload a Cloudinary
    const uploadToCloudinary = async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('upload_preset', 'products_store'); // ← Cambia esto

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/ddbhwo6fn/image/upload`, // ← Y esto
                {
                    method: 'POST',
                    body: formDataUpload
                }
            );

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    // Handle cover images
    const handleCoverImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        setUploadingImages(true);

        try {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const urls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                coverImages: [...prev.coverImages, ...urls]
            }));
        } catch (error) {
            alert('Error subiendo imágenes');
        } finally {
            setUploadingImages(false);
        }
    };

    // Handle variant images
    const handleVariantImagesUpload = async (e) => {
        const files = Array.from(e.target.files);
        setUploadingImages(true);

        try {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const urls = await Promise.all(uploadPromises);

            setCurrentVariant(prev => ({
                ...prev,
                images: [...prev.images, ...urls]
            }));
        } catch (error) {
            alert('Error subiendo imágenes de variante');
        } finally {
            setUploadingImages(false);
        }
    };

    // Add variant to product
    const addVariant = () => {
        if (!currentVariant.color.name || currentVariant.images.length === 0) {
            alert('Completa el nombre del color y agrega al menos una imagen');
            return;
        }

        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, currentVariant]
        }));

        setCurrentVariant({
            color: { name: '', hex: '#000000' },
            images: []
        });
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    // Toggle subrubro selection
    const toggleSubrubro = (subrubroId) => {
        setFormData(prev => {
            const isSelected = prev.subrubros.includes(subrubroId);
            return {
                ...prev,
                subrubros: isSelected
                    ? prev.subrubros.filter(id => id !== subrubroId)
                    : [...prev.subrubros, subrubroId]
            };
        });
    };

    // Renderizar subrubro con indentación si tiene padre
    const renderSubrubroOption = (subrubro) => {
        const indent = subrubro.parentId ? '└─ ' : '';
        const parentName = subrubro.parent ? ` (${subrubro.parent.name})` : '';
        return `${indent}${subrubro.name}${parentName}`;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error creando producto');
            }

            alert('Producto creado exitosamente');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* Información básica */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h2 className="text-lg font-semibold mb-4">Información Básica</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">SKU *</label>
                        <input
                            type="text"
                            required
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Ej: BOOT-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Nombre del producto"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Precio *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Rubro *</label>
                        <select
                            value={formData.rubro}
                            onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="darccuir">Darccuir</option>
                            <option value="yatay">Yatay</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Stock</label>
                        <input
                            type="number"
                            value={formData.stock ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({
                                    ...formData,
                                    stock: value === "" ? "" : Number(value)
                                });
                            }}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Descripción</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows="3"
                        placeholder="Descripción del producto (opcional)"
                    />
                </div>
            </div>

            {/* Subrubros */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">
                    Subrubros
                    <span className="text-sm font-normal text-gray-500 ml-2">
                        ({formData.subrubros.length} seleccionados)
                    </span>
                </h2>

                {availableSubrubros.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        No hay subrubros disponibles para {formData.rubro}.
                        <a href="/admin/subrubros" className="text-blue-600 hover:underline ml-1">
                            Crear subrubros
                        </a>
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {availableSubrubros.map(subrubro => (
                            <label
                                key={subrubro.id}
                                className={`
                                    flex items-center gap-2 p-3 border rounded-lg cursor-pointer
                                    transition-all
                                    ${formData.subrubros.includes(subrubro.id)
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'bg-white hover:bg-gray-50'
                                    }
                                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.subrubros.includes(subrubro.id)}
                                    onChange={() => toggleSubrubro(subrubro.id)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">
                                    {renderSubrubroOption(subrubro)}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Imágenes de portada */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Imágenes de Portada</h2>

                <label
                    className={`
                        flex flex-col items-center justify-center border-2 border-dashed 
                        rounded-xl p-6 cursor-pointer transition
                        ${uploadingImages ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500"}
                    `}
                >
                    <span className="text-gray-600 text-sm mb-2">
                        {uploadingImages ? "Subiendo imágenes..." : "Haz clic o arrastra imágenes aquí"}
                    </span>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleCoverImagesUpload}
                        className="hidden"
                        disabled={uploadingImages}
                    />
                </label>

                {/* Gallery */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                    {formData.coverImages.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt=""
                                className="w-full h-32 object-cover rounded-xl shadow-sm"
                            />

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        coverImages: formData.coverImages.filter((_, i) => i !== index),
                                    })
                                }
                                className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full
                                flex items-center justify-center text-sm opacity-0 group-hover:opacity-100
                                transition"
                                >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {/* Variantes de color */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Variantes de Color</h2>

                <div className="space-y-4 mb-4 border p-4 rounded bg-white">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nombre del color</label>
                            <input
                                type="text"
                                value={currentVariant.color.name}
                                onChange={(e) => setCurrentVariant({
                                    ...currentVariant,
                                    color: { ...currentVariant.color, name: e.target.value }
                                })}
                                className="w-full px-3 py-2 border rounded-lg"
                                placeholder="Ej: Negro, Suela"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Color HEX</label>
                            <input
                                type="color"
                                value={currentVariant.color.hex}
                                onChange={(e) => setCurrentVariant({
                                    ...currentVariant,
                                    color: { ...currentVariant.color, hex: e.target.value }
                                })}
                                className="w-full h-10 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Imágenes de esta variante</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleVariantImagesUpload}
                            disabled={uploadingImages}
                        />

                        <div className="grid grid-cols-4 gap-2 mt-3">
                            {currentVariant.images.map((url, index) => (
                                <img key={index} src={url} alt="" className="w-full h-20 object-cover rounded" />
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={addVariant}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        + Agregar Variante
                    </button>
                </div>

                <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded border"
                                    style={{ backgroundColor: variant.color.hex }}
                                />
                                <span className="font-medium">{variant.color.name}</span>
                                <span className="text-sm text-gray-500">
                                    ({variant.images.length} imágenes)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeVariant(index)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Creando...' : 'Crear Producto'}
                </button>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}