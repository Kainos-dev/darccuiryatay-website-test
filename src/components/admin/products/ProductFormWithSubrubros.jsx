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
        priceWholesale: '',
        description: '',
        rubro: 'darccuir',
        stock: 0,
        active: true,
        coverImages: [],
        variants: [],
        guiaTalles: null,
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
        formDataUpload.append('upload_preset', 'products_store');

        // 🔥 OPTIMIZACIONES AL SUBIR
        formDataUpload.append('quality', 'auto:good'); // Compresión inteligente
        formDataUpload.append('fetch_format', 'auto'); // WebP automático si el browser lo soporta

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/ddbhwo6fn/image/upload`,
                {
                    method: 'POST',
                    body: formDataUpload
                }
            );

            const data = await response.json();

            // 👇 DEVOLVER URL CON TRANSFORMACIONES
            // Esto asegura que siempre se sirva optimizada
            const optimizedUrl = data.secure_url.replace(
                '/upload/',
                '/upload/q_auto:good,f_auto,c_limit,w_2000/' // Max 2000px de ancho
            );

            return optimizedUrl;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    // Handler para subir guía de talles (1 imagen)
    const handleGuiaTallesUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            alert('La imagen no debe superar 10MB');
            return;
        }

        setUploadingImages(true);

        try {
            // 👇 USAR uploadToCloudinary en lugar de /api/upload
            const url = await uploadToCloudinary(file);

            // Actualizar formData con la URL de la imagen
            setFormData({
                ...formData,
                guiaTalles: url,
            });

            console.log('✅ Guía de talles subida:', url);
        } catch (error) {
            console.error('Error uploading guía de talles:', error);
            alert('Error al subir la imagen. Intenta nuevamente.');
        } finally {
            setUploadingImages(false);
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

    // Remove variant
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

                // Error esperado (negocio)
                alert(error.error || 'No se pudo crear el producto');
                return;
            }

            alert('Producto creado exitosamente');
            router.push('/admin/products');
        } catch (error) {
            console.error('Error inesperado:', error);
            alert('Error inesperado. Intente nuevamente.');
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
                        <label className="block text-sm font-medium mb-2">Precio Mayorista*</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.priceWholesale}
                            onChange={(e) => setFormData({ ...formData, priceWholesale: e.target.value })}
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

                        <select
                            value={formData.stock ?? ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    stock: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="">Selecciona una opción</option>
                            <option value="DISPONIBLE">DISPONIBLE</option>
                            <option value="SIN_STOCK">SIN STOCK</option>
                            <option value="CONSULTAR">CONSULTAR</option>
                        </select>
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

            {/* Guía de Talles */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Guía de Talles</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Imagen opcional con información de talles del producto
                </p>

                {/* Si NO hay imagen cargada */}
                {!formData.guiaTalles ? (
                    <label
                        className={`
                flex flex-col items-center justify-center border-2 border-dashed 
                rounded-xl p-8 cursor-pointer transition
                ${uploadingImages
                                ? "opacity-50 cursor-not-allowed border-gray-300"
                                : "hover:border-blue-500 border-gray-300"
                            }
            `}
                    >
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span className="text-gray-600 text-sm">
                                {uploadingImages
                                    ? "Subiendo imagen..."
                                    : "Haz clic o arrastra la imagen de talles aquí"
                                }
                            </span>
                            <span className="text-gray-400 text-xs block mt-1">
                                PNG, JPG hasta 10MB
                            </span>
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleGuiaTallesUpload}
                            className="hidden"
                            disabled={uploadingImages}
                        />
                    </label>
                ) : (
                    /* Si HAY imagen cargada */
                    <div className="relative group">
                        <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                            <img
                                src={formData.guiaTalles}
                                alt="Guía de talles"
                                className="w-full h-auto max-h-[400px] object-contain bg-gray-50"
                            />
                        </div>

                        {/* Overlay con botones */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                            {/* Botón reemplazar */}
                            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition font-medium text-sm">
                                Reemplazar
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleGuiaTallesUpload}
                                    className="hidden"
                                    disabled={uploadingImages}
                                />
                            </label>

                            {/* Botón eliminar */}
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, guiaTalles: null })}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                            >
                                Eliminar
                            </button>
                        </div>

                        {/* Badge "Vista previa" */}
                        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                            ✓ Guía cargada
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-2">Imágenes de Portada</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Imágenes principales que se mostrarán en el producto
                </p>

                {/* Dropzone */}
                <label
                    className={`
            flex flex-col items-center justify-center border-2 border-dashed
            rounded-xl p-8 cursor-pointer transition
            ${uploadingImages
                            ? "opacity-50 cursor-not-allowed border-gray-300"
                            : "hover:border-blue-500 border-gray-300"
                        }
        `}
                >
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400 mb-3"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>

                        <span className="text-gray-600 text-sm">
                            {uploadingImages
                                ? "Subiendo imágenes..."
                                : "Haz clic o arrastra imágenes de portada aquí"
                            }
                        </span>

                        <span className="text-gray-400 text-xs block mt-1">
                            PNG, JPG — múltiples imágenes
                        </span>
                    </div>

                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleCoverImagesUpload}
                        className="hidden"
                        disabled={uploadingImages}
                    />
                </label>

                {/* Galería */}
                {formData.coverImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {formData.coverImages.map((url, index) => (
                            <div
                                key={index}
                                className="relative group border rounded-xl overflow-hidden"
                            >
                                <img
                                    src={url}
                                    alt=""
                                    className="w-full h-32 object-cover bg-gray-50"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0
                                    group-hover:bg-opacity-40 transition
                                    flex items-center justify-center opacity-0
                                    group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                coverImages: formData.coverImages.filter((_, i) => i !== index),
                                            })
                                        }
                                        className="px-4 py-2 bg-red-600 text-white
                                       rounded-lg text-sm font-medium
                                       hover:bg-red-700 transition"
                                    >
                                        Eliminar
                                    </button>
                                </div>

                                {/* Badge */}
                                <div className="absolute top-2 left-2 bg-blue-600 text-white
                                    text-xs px-2 py-1 rounded-md font-medium">
                                    Portada
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Variantes de color */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                        Variantes de color
                    </h2>
                    <p className="text-sm text-gray-500">
                        Agregá colores y sus imágenes correspondientes
                    </p>
                </div>

                {/* Nueva variante */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre del color
                            </label>
                            <input
                                type="text"
                                value={currentVariant.color.name}
                                onChange={(e) =>
                                    setCurrentVariant({
                                        ...currentVariant,
                                        color: { ...currentVariant.color, name: e.target.value }
                                    })
                                }
                                placeholder="Ej: Negro, Suela"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={currentVariant.color.hex}
                                    onChange={(e) =>
                                        setCurrentVariant({
                                            ...currentVariant,
                                            color: { ...currentVariant.color, hex: e.target.value }
                                        })
                                    }
                                    className="w-12 h-10 rounded border"
                                />
                                <span className="text-sm text-gray-600">
                                    {currentVariant.color.hex}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imágenes de la variante
                        </label>

                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleVariantImagesUpload}
                            disabled={uploadingImages}
                            className="block w-full text-sm text-gray-600
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-medium
                           file:bg-blue-600 file:text-white
                           hover:file:bg-blue-700
                           cursor-pointer"
                        />

                        {currentVariant.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                {currentVariant.images.map((url, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square rounded-lg overflow-hidden border"
                                    >
                                        <img
                                            src={url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={addVariant}
                            className="inline-flex items-center gap-2 px-5 py-2.5
                           bg-green-600 text-white text-sm font-medium
                           rounded-lg hover:bg-green-700 transition"
                        >
                            + Agregar variante
                        </button>
                    </div>
                </div>

                {/* Variantes agregadas */}
                {formData.variants.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-700">
                            Variantes cargadas
                        </h3>

                        {formData.variants.map((variant, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between
                               bg-gray-50 border border-gray-200
                               rounded-lg px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-6 h-6 rounded border"
                                        style={{ backgroundColor: variant.color.hex }}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {variant.color.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {variant.images.length} imágenes
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
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