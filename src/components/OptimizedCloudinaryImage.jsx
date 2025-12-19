// components/OptimizedCloudinaryImage.jsx
'use client';

import { CldImage } from 'next-cloudinary';

/**
 * Componente optimizado para renderizar imágenes de Cloudinary
 * Aplica automáticamente:
 * - Formato WebP/AVIF (mejor compresión)
 * - Lazy loading
 * - Responsive sizes
 * - Quality optimization
 * 
 * @param {string} src - URL completa de Cloudinary o public_id
 * @param {string} alt - Texto alternativo
 * @param {number} width - Ancho deseado
 * @param {number} height - Alto deseado
 * @param {string} sizes - Sizes para responsive
 * @param {string} aspectRatio - Ratio de aspecto (ej: "1:1", "16:9")
 * @param {string} crop - Tipo de crop: "fill", "fit", "scale", "thumb"
 */
export default function OptimizedCloudinaryImage({
    src,
    alt,
    width = 800,
    height = 800,
    sizes = "100vw",
    aspectRatio = "1:1",
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    className = "",
    priority = false,
}) {
    // Extraer public_id de la URL completa de Cloudinary
    const getPublicId = (url) => {
        if (!url) return '';
        
        // Si ya es un public_id, retornarlo
        if (!url.includes('cloudinary.com')) return url;
        
        // Extraer de URL completa
        // https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/image.jpg
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
        return match ? match[1] : url;
    };

    const publicId = getPublicId(src);

    if (!publicId) {
        return (
            <div className={`bg-gray-200 ${className}`} style={{ aspectRatio }}>
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Sin imagen
                </div>
            </div>
        );
    }

    return (
        <CldImage
            src={publicId}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            crop={crop}
            gravity={gravity}
            quality={quality}
            format="auto" // WebP/AVIF automático
            loading={priority ? "eager" : "lazy"}
            className={className}
            style={{ aspectRatio }}
        />
    );
}