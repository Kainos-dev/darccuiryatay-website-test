// components/admin/CloudinaryGuiaTalleUploader.jsx
'use client';

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

/**
 * Componente para subir y gestionar UNA sola imagen de Cloudinary
 * 
 * @param {String} imageUrl - URL de la imagen actual
 * @param {Function} onImageChange - Callback cuando cambia la imagen
 * @param {String} label - Etiqueta del componente
 * @param {String} folder - Carpeta en Cloudinary
 */
export default function CloudinaryGuiaTalleUploader({
    imageUrl = '',
    onImageChange,
    label = "Imagen",
    folder = "products"
}) {

    const handleUploadSuccess = (result) => {
        if (result.event === 'success') {
            const newUrl = result.info.secure_url;
            onImageChange(newUrl);
        }
    };

    const handleRemoveImage = () => {
        onImageChange('');
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    <span className="text-xs text-gray-500 font-normal ml-2">
                        (opcional)
                    </span>
                </label>

                <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={handleUploadSuccess}
                    options={{
                        multiple: false,
                        maxFiles: 1,
                        resourceType: 'image',
                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                        maxFileSize: 5000000, // 5MB
                        folder: folder,
                    }}
                >
                    {({ open }) => (
                        <button
                            type="button"
                            onClick={() => open()}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {imageUrl ? '📝 Cambiar Imagen' : '+ Agregar Imagen'}
                        </button>
                    )}
                </CldUploadWidget>
            </div>

            {/* Vista previa de la imagen */}
            {imageUrl ? (
                <div className="relative group w-full max-w-md aspect-3/4 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                        src={imageUrl}
                        alt={label}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Overlay con botón de eliminar */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                            title="Eliminar imagen"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 max-w-md">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">No hay imagen cargada</p>
                    <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar Imagen"</p>
                </div>
            )}
        </div>
    );
}