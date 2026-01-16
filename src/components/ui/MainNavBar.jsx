//app/[darccuir/yatay]/page.js/carrousel.jsx
'use client';
import { useState } from "react";
import { useSession } from "next-auth/react";       //usamos esto en lugar de "auth" para manejar la session en un clientComponentn
import Image from "next/image"
import Link from "next/link"
import { Search, UserRound, ShoppingCart } from "lucide-react";
import { inter } from "@/app/ui/fonts";
// components : 
import SearchBar from "./SearchBar";
import UserDropdown from "./UserDropdown";
import CartIcon from "../cart/CartIcon";
import CartDrawer from "../cart/CartDrawer";


export default function MainNavBar({
    rubro,
    logo
}) {
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
                <SearchBar
                    mode="home"
                    redirectTo="/darccuir/catalog"
                    variant="dark"
                    placeholder="Buscar productos..."
                />
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
                <CartIcon
                    onClick={() => setIsCartOpen(true)}
                    iconClassname="text-white hover:text-gray-400"
                />

                <CartDrawer
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                />
            </div>

        </div>
    )
}