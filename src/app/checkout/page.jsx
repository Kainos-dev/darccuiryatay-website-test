// app/checkout/page.jsx (SERVER)
import { auth } from "@/auth";
import CheckoutClient from "@/components/ui/CheckoutClient";

export default async function CheckoutPage() {
    const session = await auth();

    return <CheckoutClient session={session} />;
}