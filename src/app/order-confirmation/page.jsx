"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Mail, Home } from "lucide-react";

function OrderConfirmationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            router.push("/");
            return;
        }

        // Fetch order details
        fetch(`/api/orders/${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.order) {
                    setOrder(data.order);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-brown border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Orden no encontrada
                    </h1>
                    <Link
                        href="/"
                        className="text-brown hover:underline"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">

                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ¡Pedido confirmado!
                    </h1>
                    <p className="text-gray-600">
                        Hemos recibido tu pedido exitosamente
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between pb-4 border-b">
                        <div>
                            <p className="text-sm text-gray-600">Número de orden</p>
                            <p className="text-2xl font-bold text-brown">
                                {order.orderNumber}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total pagado</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${order.total.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="pt-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Información del cliente
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Nombre:</strong> {order.customerName}</p>
                            <p><strong>Email:</strong> {order.customerEmail}</p>
                            {order.customerPhone && (
                                <p><strong>Teléfono:</strong> {order.customerPhone}</p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-4 mt-4 border-t">
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Dirección de envío
                        </h3>
                        <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress.street}</p>
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="pt-4 mt-4 border-t">
                        <h3 className="font-semibold text-gray-900 mb-3">
                            Productos ({order.items.length})
                        </h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">
                                            {item.productName}
                                        </p>
                                        {item.variantColor && (
                                            <p className="text-gray-500">
                                                Color: {item.variantColor}
                                            </p>
                                        )}
                                        <p className="text-gray-500">
                                            Cantidad: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            ${item.subtotal.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            ${item.price.toFixed(2)} c/u
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estimated Delivery */}
                    {/* {order.estimatedDelivery && (
                        <div className="pt-4 mt-4 border-t">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-900">
                                    <strong>📅 Entrega estimada:</strong> {order.estimatedDelivery}
                                </p>
                            </div>
                        </div>
                    )} */}
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Mail className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Email enviado
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Te enviamos un email de confirmación a {order.customerEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Seguimiento
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Recibirás actualizaciones sobre el estado de tu pedido
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/"
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-brown text-brown py-3 px-6 rounded-lg font-semibold hover:bg-brown hover:text-white transition"
                    >
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-brown border-t-transparent rounded-full"></div>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}