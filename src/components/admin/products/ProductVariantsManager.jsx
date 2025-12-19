// components/admin/ProductVariantsManager.jsx
'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { CldImage } from 'next-cloudinary';

/**
 * Componente para gestionar variantes de producto (colores con imágenes)
 * 
 * @param {Array} variants - Array de variantes { color: { name, hex }, images: [] }
 * @param {Function} onVariantsChange - Callback cuando cambian las variantes
 */
export default function ProductVariantsManager({ variants = [], onVariantsChange }) {
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

    const getPublicId = (url) => {
        if (!url) return '';
        if (!url.includes('cloudinary.com')) return url;
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        return match ? match[1] : url;
    };

    const handleAddVariant = () => {
        if (!newColor.name.trim()) {
            alert('Ingresa un nombre de color');
            return;
        }

        const newVariant = {
            color: {
                name: newColor.name.trim(),
                hex: newColor.hex
            },
            images: []
        };

        onVariantsChange([...variants, newVariant]);
        setNewColor({ name: '', hex: '#000000' });
        setIsAddingVariant(false);
    };

    const handleRemoveVariant = (indexToRemove) => {
        if (confirm('¿Eliminar esta variante y todas sus imágenes?')) {
            const newVariants = variants.filter((_, index) => index !== indexToRemove);
            onVariantsChange(newVariants);
        }
    };

    const handleAddImageToVariant = (variantIndex, imageUrl) => {
        const newVariants = [...variants];
        newVariants[variantIndex].images.push(imageUrl);
        onVariantsChange(newVariants);
    };

    const handleRemoveImageFromVariant = (variantIndex, imageIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].images.splice(imageIndex, 1);
        onVariantsChange(newVariants);
    };

    const handleUpdateColor = (variantIndex, field, value) => {
        const newVariants = [...variants];
        newVariants[variantIndex].color[field] = value;
        onVariantsChange(newVariants);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Variantes de Color
                    <span className="text-xs text-gray-500 font-normal ml-2">
                        ({variants.length} variantes)
                    </span>
                </label>

                <button
                    type="button"
                    onClick={() => setIsAddingVariant(true)}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    + Agregar Variante
                </button>
            </div>

            {/* Modal para agregar variante */}
            {isAddingVariant && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    <h4 className="font-medium text-gray-900">Nueva Variante de Color</h4>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre del Color *
                            </label>
                            <input
                                type="text"
                                value={newColor.name}
                                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                placeholder="Ej: Rojo, Azul, Negro"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Código Hex
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={newColor.hex}
                                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={newColor.hex}
                                    onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                                    placeholder="#000000"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingVariant(false);
                                setNewColor({ name: '', hex: '#000000' });
                            }}
                            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Agregar
                        </button>
                    </div>
                </div>
            )}

            {/* Lista de variantes */}
            {variants.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-sm text-gray-500">No hay variantes de color</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {variants.map((variant, variantIndex) => (
                        <div
                            key={variantIndex}
                            className="p-4 bg-white border border-gray-200 rounded-lg space-y-3"
                        >
                            {/* Header de la variante */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded border-2 border-gray-300"
                                        style={{ backgroundColor: variant.color.hex }}
                                        title={variant.color.hex}
                                    />
                                    <div>
                                        <input
                                            type="text"
                                            value={variant.color.name}
                                            onChange={(e) => handleUpdateColor(variantIndex, 'name', e.target.value)}
                                            className="font-medium text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none px-1"
                                        />
                                        <p className="text-xs text-gray-500">
                                            {variant.images.length} imágenes
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CldUploadWidget
                                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                        onSuccess={(result) => {
                                            if (result.event === 'success') {
                                                handleAddImageToVariant(variantIndex, result.info.secure_url);
                                            }
                                        }}
                                        options={{
                                            multiple: false,
                                            maxFiles: 1,
                                            resourceType: 'image',
                                            folder: 'products/variants',
                                        }}
                                    >
                                        {({ open }) => (
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                            >
                                                + Imagen
                                            </button>
                                        )}
                                    </CldUploadWidget>

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveVariant(variantIndex)}
                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>

                            {/* Grid de imágenes de la variante */}
                            {variant.images.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {variant.images.map((imageUrl, imageIndex) => (
                                        <div
                                            key={imageIndex}
                                            className="relative group aspect-square bg-gray-100 rounded overflow-hidden border border-gray-200"
                                        >
                                            <CldImage
                                                src={getPublicId(imageUrl)}
                                                alt={`${variant.color.name} ${imageIndex + 1}`}
                                                fill
                                                crop="fill"
                                                gravity="auto"
                                                quality="auto"
                                                format="auto"
                                                className="object-cover"
                                                sizes="100px"
                                            />

                                            {/* Botón eliminar */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImageFromVariant(variantIndex, imageIndex)}
                                                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                                            >
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 italic text-center py-4 bg-gray-50 rounded">
                                    Sin imágenes para esta variante
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}