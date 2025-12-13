"use client";

import Image from "next/image";
import ProductCard from "@/components/products/ProductCard";
import { motion } from "framer-motion";

// ============================================
// OPCIÓN 1: SCROLL INTERNO CON FADE ANIMATIONS (RECOMENDADA)
// ============================================
export default function FeaturedProductsSection({ products, heroImage }) {
    return (
        <section className="w-full px-4 sm:px-8 lg:px-10 my-50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* COLUMNA IZQUIERDA – Imagen destacada con animación */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-[500px] lg:h-[650px] rounded-xl overflow-hidden shadow-md lg:sticky lg:top-24"
                >
                    <Image
                        src={heroImage}
                        alt="Destacado"
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority
                    />

                    {/* TEXTO SUPERPUESTO */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="absolute bottom-0 left-0 p-8 text-white"
                    >
                        <h2 className="text-4xl font-bold drop-shadow-xl">
                            NUESTROS PRODUCTOS
                        </h2>
                        <p className="text-lg mt-2 drop-shadow-xl">
                            Hechos para durar. Pensados para disfrutar
                        </p>
                    </motion.div>
                </motion.div>

                {/* COLUMNA DERECHA – Con scroll interno */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col lg:h-[650px]"
                >
                    {/* Contenedor con scroll */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {/* GRID 2×2 DE PRODUCTOS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* BOTÓN VER CATÁLOGO - Siempre visible */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex justify-center mt-6 pt-4 border-t border-gray-200"
                    >
                        <motion.a
                            href="/darccuir/catalogo"
                            whileTap={{ scale: 0.95 }}
                            className="px-24 py-2 bg-brown text-white rounded-md font-semibold tracking-wide hover:bg-light-brown transition-colors"
                        >
                            VER CATÁLOGO →
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Estilos para scrollbar personalizado */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </section>
    );
}