// components/admin/CloudinaryImageUploader.jsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

/**
 * Componente reutilizable para subir y gestionar imágenes de Cloudinary
 * 
 * @param {Array} images - Array de URLs de imágenes
 * @param {Function} onImagesChange - Callback cuando cambian las imágenes
 * @param {Number} maxFiles - Máximo de imágenes permitidas
 * @param {String} label - Etiqueta del componente
 */
export default function CloudinaryImageUploader({
    images = [],
    onImagesChange,
    maxFiles = 5,
    label = "Imágenes"
}) {
    
    const handleUploadSuccess = (result) => {
        if (result.event === 'success') {
            const newUrl = result.info.secure_url;
            onImagesChange([...images, newUrl]);
        }
    };

    console.log(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET)

    const handleRemoveImage = (indexToRemove) => {
        const newImages = images.filter((_, index) => index !== indexToRemove);
        onImagesChange(newImages);
    };

    const handleReorder = (dragIndex, dropIndex) => {
        const newImages = [...images];
        const [removed] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, removed);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    <span className="text-xs text-gray-500 font-normal ml-2">
                        ({images.length}/{maxFiles})
                    </span>
                </label>

                {images.length < maxFiles && (
                    <CldUploadWidget
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                        onSuccess={handleUploadSuccess}
                        options={{
                            multiple: false,
                            maxFiles: 1,
                            resourceType: 'image',
                            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                            maxFileSize: 5000000, // 5MB
                            folder: 'products', // Carpeta en Cloudinary
                        }}
                    >
                        {({ open }) => (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                + Agregar Imagen
                            </button>
                        )}
                    </CldUploadWidget>
                )}
            </div>

            {/* Grid de imágenes */}
            {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition"
                        >
                            <Image
                                src={url}
                                alt={`Imagen ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 20vw"
                            />

                            {/* Overlay con controles */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                {/* Botón eliminar */}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                                    title="Eliminar imagen"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>

                                {/* Botón mover izquierda */}
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleReorder(index, index - 1)}
                                        className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition"
                                        title="Mover a la izquierda"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {/* Botón mover derecha */}
                                {index < images.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleReorder(index, index + 1)}
                                        className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-800 transition"
                                        title="Mover a la derecha"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Badge de posición */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                            </div>

                            {/* Badge "Principal" para la primera imagen */}
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                    Principal
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No hay imágenes cargadas</p>
                </div>
            )}
        </div>
    );
}