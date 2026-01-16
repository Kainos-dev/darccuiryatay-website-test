"use client"

import { useState, useEffect } from 'react';
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Image from 'next/image';
import { inter, domine } from '@/app/ui/fonts';

// components :
import MainNavBar from "./MainNavBar"
import SubrubrosSection from "./SubrubrosSection";

const MESSAGES = [
    "📦 Envíos a todo el país",
    "💳 Hasta 3 cuotas sin interés",
    "🔥 Ofertas exclusivas en nuestra web",
    "🛒 Envíos gratis en compras mayores a $150.000 ARG",
];

export default function Carrousel({
    rubro,
    images,
    title,
    yatayLogo,
    subrubros
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === images.length - 1 ? 0 : prevIndex + 1
            );
        }, 2500);

        return () => clearInterval(interval);
    }, [currentIndex]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full h-screen max-h-screen overflow-hidden">
            {/* Imágenes del carrusel */}
            {images.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <Image
                        src={src}
                        alt={`Hero ${index + 1}`}
                        fill
                        priority={index === 0}
                        className="object-cover"
                        quality={90}
                    />
                </div>
            ))}

            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Overlay inferior */}
            <div className="absolute bottom-0 left-0 w-full h-10 bg-linear-to-t from-white to-transparent pointer-events-none"></div>

            <div className="bg-black w-full border h-10 absolute top-0">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className={`${inter.className} absolute text-white flex justify-center items-center w-full h-full text-sm sm:text-base font-medium`}
                    >
                        {MESSAGES[index]}
                    </motion.span>
                </AnimatePresence>
            </div>

            <MainNavBar
                rubro={rubro}
                logo={yatayLogo}
            />
            <SubrubrosSection subrubros={subrubros} variant="light" />

            {/* Contenido en esquina inferior izquierda */}
            <div className="absolute bottom-8 left-8 z-20 sm:bottom-12 sm:left-12 lg:bottom-28 lg:left-24 flex flex-col items-start gap-4">
                <h1 className={`${domine.className} text-3xl sm:text-4xl md:text-5xl font-bold text-white text-left`}>
                    NUESTROS PRODUCTOS
                </h1>

                <Link
                    href="/darccuir/catalog"
                    className={`${inter.className} inline-block px-6 py-2 bg-brown text-sm text-white rounded-md font-semibold tracking-wide hover:bg-light-brown transition-colors shadow-lg`}
                >
                    VER CATÁLOGO →
                </Link>
            </div>
        </section>
    )
}