//app/[darccuir/yatay]/page.js/carrousel.jsx
'use client';
import { useState } from "react";
import { useSession } from "next-auth/react";       //usamos esto en lugar de "auth" para manejar la session en un clientComponentn
import Image from "next/image"
import Link from "next/link"
import { Search, UserRound, ShoppingCart } from "lucide-react";
import { inter } from "@/app/ui/fonts";
// components : 
/* import BtnLogin from "./BtnLogin" */
import UserDropdown from "./UserDropdown";
import CartIcon from "../cart/CartIcon";
import CartDrawer from "../cart/CartDrawer";


export default function MainNavBar({ rubro, logo }) {
    const { data: session, status } = useSession();
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-10 z-20">
            <Image
                src={logo}
                alt={`${rubro} Logo`}
                width={125}
                height={125}
                className="mb-6 sm:mb-8 border-4"
            />


            {/* Barra de búsqueda */}
            < div className="relative w-full max-w-md mb-4" >
                <input
                    type="text"
                    aria-label="Buscar productos"
                    placeholder="Buscar..."
                    className="w-full pl-11 pr-4 py-2.5 
                    border-b border-gray-300 
                    focus:border-white focus:ring-0 
                    transition-all outline-none text-white"

                />

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5 text-white" />
                </span>
            </div >

            <div className={`${inter.className} flex items-center gap-3 text-white px-4 h-14`}>
                {/* LOCALES */}
                <Link
                    href="/locales"
                    className="text-sm font-medium hover:text-gray-300 transition-colors"
                >
                    LOCALES
                </Link>

                {/* Separador */}
                <div className=" w-px bg-gray-500/40">/</div>

                {/* Usuario */}
                {session?.user ? (
                    <UserDropdown user={session.user} />
                ) : (
                    <Link
                        href="/auth/login"
                        className="text-sm font-medium hover:text-gray-300 transition-colors"
                    >
                        INICIAR SESIÓN
                    </Link>
                )}

                {/* Separador */}
                <div className="w-px bg-gray-500/40">/</div>

                {/* Carrito */}
                <CartDrawer
                    rubro={rubro}
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                />

                <CartIcon onClick={() => setIsCartOpen(true)} />
            </div>

        </div>
    )
}