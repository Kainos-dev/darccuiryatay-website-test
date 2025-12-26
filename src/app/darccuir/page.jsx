import { getSubrubrosRecursive } from "@/lib/utils/getSubrubrosRecursive";
import { getNews } from "@/actions/products/products.actions.js";
//components
import Carrousel from "@/components/ui/Carrousel"
import NewsCarrousel from "@/components/ui/NewsCarrousel";
import FeaturedProductsSection from "@/components/ui/FeaturedProductsSection";
import Footer from "@/components/ui/Footer";

const rubro = "darccuir";
const imagesDarccuir = [
    'https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760909471/Portada_Colores_Varios_mzbmub.jpg',
    'https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760583671/Detalle_Suela_ricml5.jpg',
    'https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760675900/Portada_ahk5km.jpg'
];

const darccuirTitle = "https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1763697279/letras-darccuir_ux09hk.png"
const darccuirLogo = "https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1763697298/logo-darccuir-blanco_osmcmx.png"



export default async function DarccuirPage() {
    const productsForSection = await prisma.product.findMany({
        where: {
            rubro: "darccuir"
        },
        orderBy: { createdAt: "desc" },
        take: 4
    });


    const subrubros = await getSubrubrosRecursive(null, rubro);
    const news = await getNews(rubro, 12);
    /* console.log("🚀 ~ Darccuir Page ~ news:", news) */

    return (
        <>
            <Carrousel
                rubro={rubro}
                images={imagesDarccuir}
                title={darccuirTitle}
                yatayLogo={darccuirLogo}
                subrubros={subrubros}
            />

            <NewsCarrousel productos={news} />

            <FeaturedProductsSection
                products={productsForSection}
                heroImage={"https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760930763/bg-hero-03_jmk49f.jpg"}
            />

            <Footer />
        </>
    )
}

