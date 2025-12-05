// app/products/[id]/page.tsx (SERVER COMPONENT)
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products/getProductById"; // server fetch
import ProductView from "@/components/products/ProductView";

export default async function ProductPage({ params }) {
    const { id } = await params;

    const product = await getProductById(id);
    if (!product) return notFound();

    /* console.log("PRODUCTO: ", product) */

    return (
        <ProductView product={product} />
    );
}
