// components/ZoomOverlay.jsx
export default function ZoomOverlay({ isZooming, zoomPosition, src }) {
    if (!isZooming) return null;

    return (
        <div
            className="hidden lg:block fixed right-10 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]
                       bg-white rounded-lg shadow-2xl overflow-hidden z-50 border-4 border-gray-200
                       pointer-events-none"
        >
            <div
                className="w-full h-full"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundSize: "200%",
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: "no-repeat",
                }}
            />

            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                🔍 2x Zoom
            </div>
        </div>
    );
}
