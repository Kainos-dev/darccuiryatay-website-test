import { inter } from "@/app/ui/fonts"

export default function Footer() {
    return (
        <footer className={`bg-neutral-950 text-neutral-300 ${inter.className}`}>
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid gap-12 md:grid-cols-3">
                    {/* Marca */}
                    <section>
                        <h2 className="text-xl font-semibold tracking-wide text-neutral-100">
                            DARCCUIRYATAY
                        </h2>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed">
                            Cueros seleccionados para proyectos únicos.
                        </p>
                    </section>

                    {/* Información legal */}
                    <section>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-100">
                            Información
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>Política de privacidad</li>
                            <li>Términos y condiciones</li>
                            <li>Cambios y devoluciones</li>
                            <li>Envíos</li>
                        </ul>
                    </section>

                    {/* Contacto */}
                    <section>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-100">
                            Contacto
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm">
                            <li>📍 Argentina</li>
                            <li>📧 contacto@darccuiryatay.com</li>
                            <li>📱 WhatsApp</li>
                            <li>🕘 Lun a Vie · 9 a 18 hs</li>
                        </ul>
                    </section>
                </div>

                {/* Divider */}
                <div className="my-12 h-px w-full bg-neutral-800" />

                {/* Bottom */}
                <div className="flex flex-col items-center justify-between gap-4 text-xs text-neutral-400 md:flex-row">
                    <span>
                        © {new Date().getFullYear()} darccuiryatay · Todos los derechos
                        reservados
                    </span>

                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-neutral-200 transition">
                            Instagram
                        </span>
                        <span className="cursor-pointer hover:text-neutral-200 transition">
                            Facebook
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}