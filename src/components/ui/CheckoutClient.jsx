"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";
import Link from "next/link";
import { clearCart as clearCartAction } from "@/actions/cart/clear-cart";
import { ArrowLeft, ShoppingBag, MapPin, User, Mail, Phone } from "lucide-react";

export default function CheckoutClient({ session }) {
    const router = useRouter();
    const { items, getTotal, clearCart } = useCartStore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        // Datos del cliente
        firstName: session?.user?.firstName || "",
        lastName: session?.user?.lastName || "",
        email: session?.user?.email || "",
        phone: session?.user?.phone || "",

        // Dirección de envío
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Argentina",

        // Notas adicionales
        notes: "",
    });

    useEffect(() => {
        if (items.length === 0) {
            router.push("/cart");
        }
    }, [items.length, router]);

    if (items.length === 0) {
        return null;
    }

    const total = getTotal();
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer: {
                        name: `${formData.firstName} ${formData.lastName}`,
                        email: formData.email,
                        phone: formData.phone,
                    },
                    shippingAddress: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                        country: formData.country,
                    },
                    items: items.map(item => ({
                        productId: item.id,
                        name: item.name,
                        sku: item.sku,
                        price: item.price,
                        quantity: item.quantity,
                        variant: item.variant || null,
                    })),
                    subtotal: total,
                    shipping: 0,
                    total: total,
                    notes: formData.notes,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Error al procesar la orden");
            }

            // Limpiar carrito
            clearCart();

            // Limpiar carrito en el servidor si el usuario está logueado
            if (session?.user?.id) {
                await clearCartAction()
            }

            // Mostrar success y redirigir
            toast.success("¡Pedido realizado con éxito!");
            router.push(`/order-confirmation?orderId=${data.orderId}`);

        } catch (error) {
            console.error("Error:", error);
            toast.error(error.message || "Error al procesar el pedido");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-brown transition mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver al carrito
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Finalizar pedido
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Datos personales */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={24} className="text-brown" />
                                    Datos personales
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Apellido *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail size={16} />
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Phone size={16} />
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Dirección de envío */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={24} className="text-brown" />
                                    Dirección de envío
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Calle y número *
                                    </label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Av. Corrientes 1234"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ciudad *
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Provincia *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Código postal *
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            País
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notas adicionales */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">
                                    Notas adicionales (opcional)
                                </h2>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Ej: Entregar en horario de tarde, timbre no funciona, etc."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent resize-none"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Resumen del pedido
                            </h2>

                            {/* Productos */}
                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.variant?.color || 'default'}`} className="flex gap-3">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
                                            {item.coverImages?.[0] && (
                                                <img
                                                    src={item.coverImages[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.name}
                                            </p>
                                            {item.variant && (
                                                <p className="text-xs text-gray-500">
                                                    Color: {item.variant.color}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Cantidad: {item.quantity}
                                            </p>
                                            <p className="text-sm font-semibold text-brown">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 mb-6 pt-6 border-t">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-green-600 font-semibold">Gratis</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total</span>
                                    <span className="text-brown">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Botón de envío */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-brown text-white py-3 rounded-lg font-semibold hover:brightness-110 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Procesando..." : "Confirmar pedido"}
                            </button>

                            {/* Info seguridad */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                Recibirás un email de confirmación con los detalles de tu pedido
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}