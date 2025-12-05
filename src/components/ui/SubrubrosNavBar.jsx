'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Componente recursivo para manejar cualquier nivel de jerarquía
function SubrubroItem({ subrubro, level = 0, onClose }) {
    const [isOpen, setIsOpen] = useState(false);
    const tieneHijos = subrubro.children && subrubro.children.length > 0;

    if (!tieneHijos) {
        // Subrubro sin hijos - link directo
        return (
            <Link
                href={`/productos/${subrubro.slug}`}
                onClick={onClose}
                className={`block px-4 py-2 text-sm text-gray-700 
                    hover:bg-gray-100 transition-colors
                    ${level > 0 ? 'pl-' + (4 + level * 4) : ''}`}
            >
                {subrubro.name}
            </Link>
        );
    }

    // Subrubro con hijos
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2 
                    text-sm text-gray-700 hover:bg-gray-100 transition-colors uppercase
                    ${level > 0 ? 'pl-' + (4 + level * 4) : ''}`}
            >
                <span>{subrubro.name}</span>
                <ChevronRight
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''
                        }`}
                />
            </button>

            {/* Hijos (recursión) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50"
                    >
                        {subrubro.children.map((hijo) => (
                            <SubrubroItem
                                key={hijo.id}
                                subrubro={hijo}
                                level={level + 1}
                                onClose={onClose}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function SubrubrosNavBar({ subrubros }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Solo los subrubros de nivel superior (sin padre)
    const padres = subrubros.filter(sub => !sub.parentId);

    return (
        <div className="w-full sticky top-50 z-40">
            <div className="max-w-7xl mx-auto flex gap-4 px-4 py-3" ref={dropdownRef}>
                {padres.map((padre) => {
                    const tieneHijos = padre.children && padre.children.length > 0;

                    return (
                        <div key={padre.id} className="relative">
                            {tieneHijos ? (
                                // Padre con dropdown
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setOpenDropdown(
                                            openDropdown === padre.id ? null : padre.id
                                        )}
                                        className="whitespace-nowrap px-4 py-2 text-white text-base font-medium
                                                flex items-center gap-2 uppercase"
                                    >
                                        {padre.name}
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${openDropdown === padre.id ? 'rotate-180' : ''}`}
                                        />
                                    </motion.button>

                                    {/* Dropdown con recursión */}
                                    <AnimatePresence>
                                        {openDropdown === padre.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 mt-2
                                                        bg-white rounded-lg shadow-lg
                                                        min-w-[220px] py-2 z-50 
                                                        border border-gray-200 max-h-96 
                                                        overflow-y-auto"
                                            >
                                                {padre.children.map((hijo) => (
                                                    <SubrubroItem
                                                        key={hijo.id}
                                                        subrubro={hijo}
                                                        level={0}
                                                        onClose={() => setOpenDropdown(null)}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                // Padre sin hijos - link directo
                                <Link href={`/productos/${padre.slug}`}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="whitespace-nowrap px-4 py-2 rounded-full
                                                bg-gray-100 hover:bg-gray-200
                                                text-gray-700 text-sm font-medium"
                                    >
                                        {padre.name}
                                    </motion.button>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}