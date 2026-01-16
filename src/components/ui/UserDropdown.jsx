// components/UserDropdown.jsx
"use client";

import { Menu, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { UserRound, LogOut, Settings, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { barlow } from "@/app/ui/fonts";
import Link from "next/link";
import Image from "next/image";

export default function UserDropdown({ user }) {
    const userRole = user?.role || 'minorista';

    const url = userRole === 'admin' ? '/admin' : '/user';

    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center focus:outline-none">
                {user?.image ? (
                    <Image
                        src={user.image}
                        alt="User avatar"
                        width={40}
                        height={40}
                        className="rounded-full cursor-pointer border border-gray-300"
                    />
                ) : (
                    <UserRound size={25} className="text-gray-200 cursor-pointer mb-1" />
                )}
            </Menu.Button>

            <Transition
                enter="transition duration-150 ease-out"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition duration-100 ease-in"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    as={motion.div}
                    className="
                    absolute right-0 mt-3 w-56 
                    origin-top-right rounded-xl 
                    bg-white shadow-lg ring-1 ring-black/5 
                    focus:outline-none overflow-hidden
                    "
                >
                    <div className={`${barlow.className} text-xl px-4 py-3 border-b`}>
                        <p className="font-semibold text-gray-900">
                            {user?.firstName ?? "Usuario"}
                        </p>
                        <p className="text-base text-gray-500">
                            {user?.email}
                        </p>
                    </div>

                    {/* Opciones */}
                    <div className="py-1 text-gray-500">
                        {/* PERFIL */}
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href={url}
                                    className={`
                                            flex items-center gap-3 px-4 py-2 text-sm
                                            ${active ? "bg-gray-100" : ""}
                                        `}
                                >
                                    <UserCircle2 className="w-5 h-5" />
                                    Mi Perfil
                                </Link>
                            )}
                        </Menu.Item>

                        {/* CONFIGURACION */}
                        {/* <Menu.Item>
                            {({ active }) => (
                                <Link
                                    href="/configuracion"
                                    className={`
                                        flex items-center gap-3 px-4 py-2 text-sm
                                        ${active ? "bg-gray-100" : ""}
                                    `}
                                >
                                    <Settings className="w-5 h-5" />
                                    Configuración
                                </Link>
                            )}
                        </Menu.Item> */}

                        {/* CERRAR SESSION */}
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => signOut()}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2 text-sm text-left
                                        ${active ? "bg-gray-100" : ""}
                                    `}
                                >
                                    <LogOut className="w-5 h-5" />
                                    Cerrar sesión
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu >
    );
}
