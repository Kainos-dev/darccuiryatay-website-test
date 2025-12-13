'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { domine } from '@/app/ui/fonts';

// Componente recursivo para manejar cualquier nivel de jerarquía
function SubrubroItem({ subrubro, level = 0, onClose, selectedSubrubro }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tieneHijos = subrubro.children && subrubro.children.length > 0;

    const handleFilter = (e) => {
        e.stopPropagation(); // Evitar que se propague al toggle

        const params = new URLSearchParams(searchParams.toString());

        // Toggle: si ya está seleccionado, lo quitamos
        if (selectedSubrubro === subrubro.id) {
            params.delete('subrubro');
        } else {
            params.set('subrubro', subrubro.id);
        }

        // Resetear página al filtrar
        params.delete('page');

        // Navegar con los nuevos params
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
        onClose();
    };

    const toggleOpen = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const isSelected = selectedSubrubro === subrubro.id;

    if (!tieneHijos) {
        // Subrubro sin hijos - solo botón de filtro
        return (
            <button
                onClick={handleFilter}
                className={`block w-full text-left px-4 py-2 text-sm 
                    hover:bg-gray-100 transition-colors uppercase
                    ${level > 0 ? 'pl-' + (4 + level * 4) : ''}
                    ${isSelected ? 'bg-[#A27B5C] text-white hover:bg-[#8d6a4d]' : 'text-gray-700'}`}
            >
                {subrubro.name}
            </button>
        );
    }

    // Subrubro con hijos - dividir en dos áreas clicables
    return (
        <div className="relative">
            <div
                className={`w-full flex items-center justify-between px-4 py-2 
                    text-sm hover:bg-gray-100 transition-colors uppercase
                    ${level > 0 ? 'pl-' + (4 + level * 4) : ''}
                    ${isSelected ? 'bg-[#A27B5C] text-white' : 'text-gray-700'}`}
            >
                {/* Área clicable para filtrar (nombre) */}
                <button
                    onClick={handleFilter}
                    className="flex-1 text-left uppercase"
                >
                    {subrubro.name}
                </button>

                {/* Área clicable para abrir/cerrar (flecha) */}
                <button
                    onClick={toggleOpen}
                    className="p-1 hover:bg-black/10 rounded"
                >
                    <ChevronRight
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                </button>
            </div>

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
                                selectedSubrubro={selectedSubrubro}
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
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const selectedSubrubro = searchParams.get('subrubro');

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

    // Función para limpiar filtros
    const handleClearFilters = () => {
        router.push(pathname, { scroll: false });
    };

    // Solo los subrubros de nivel superior (sin padre)
    const padres = subrubros.filter(sub => !sub.parentId);

    return (
        <div className={`${domine.className} w-full sticky top-65 z-40`}>
            <div className="max-w-7xl mx-auto flex gap-4 px-4 py-3 items-center" ref={dropdownRef}>
                {padres.map((padre) => {
                    const tieneHijos = padre.children && padre.children.length > 0;
                    const isParentSelected = selectedSubrubro === padre.id;

                    return (
                        <div key={padre.id} className="relative">
                            {tieneHijos ? (
                                // Padre con dropdown - dividir acciones
                                <>
                                    <div className={`flex items-center gap-1 px-4 py-2 rounded
                                        ${isParentSelected ? 'bg-brown text-white' : 'text-black'}`}>

                                        {/* Botón para filtrar por el padre */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const params = new URLSearchParams(searchParams.toString());
                                                if (isParentSelected) {
                                                    params.delete('subrubro');
                                                } else {
                                                    params.set('subrubro', padre.id);
                                                }
                                                params.delete('page');
                                                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                            }}
                                            className="whitespace-nowrap text-base font-medium uppercase"
                                        >
                                            {padre.name}
                                        </motion.button>

                                        {/* Botón para abrir dropdown */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setOpenDropdown(
                                                openDropdown === padre.id ? null : padre.id
                                            )}
                                            className="p-1 hover:bg-light-brown/50"
                                        >
                                            <ChevronDown
                                                className={`w-4 h-4 transition-transform ${openDropdown === padre.id ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </motion.button>
                                    </div>

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
                                                        selectedSubrubro={selectedSubrubro}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            ) : (
                                // Padre sin hijos - botón de filtro directo
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams.toString());
                                        if (isParentSelected) {
                                            params.delete('subrubro');
                                        } else {
                                            params.set('subrubro', padre.id);
                                        }
                                        params.delete('page');
                                        router.push(`${pathname}?${params.toString()}`, { scroll: false });
                                    }}
                                    className={`whitespace-nowrap px-4 py-2 text-base font-medium
                                            uppercase rounded
                                            ${isParentSelected ? 'bg-[#A27B5C] text-white' : 'text-black'}`}
                                >
                                    {padre.name}
                                </motion.button>
                            )}
                        </div>
                    );
                })}

                {/* Botón para limpiar filtros */}
                {selectedSubrubro && (
                    <button
                        onClick={handleClearFilters}
                        className="ml-auto text-sm text-gray-600 hover:text-gray-900 
                                 underline transition-colors"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    );
}