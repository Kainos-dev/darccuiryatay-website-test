import { getSubrubrosRecursive } from "@/lib/utils/getSubrubrosRecursive";
import { getNews } from "@/actions/products/getNews";
//components
import Carrousel from "@/components/ui/Carrousel"
import NewsCarrousel from "@/components/ui/NewsCarrousel";

const rubro = "yatay";
const imagesYatay = [
    'https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760907710/Crudo_erjpm7.jpg',
    'https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760907717/Portada_jj6hb4.jpg',
    'https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760760946/Cemento_c8kzfa.jpg'
];

const yatayTitle = "https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1763697279/letras-yatay_hrbp3u.png"
const yatayLogo = "https://res.cloudinary.com/ddbhwo6fn/image/upload/v1764610532/palmerayatay_sneoya.png"

/* ## Cómo funciona:

1. **`SubrubroItem` es recursivo**: Se llama a sí mismo para renderizar hijos, nietos, bisnietos, etc.
2. **Indentación visual**: Cada nivel tiene más padding (`pl-4`, `pl-8`, etc.)
3. **Flechas diferentes**: 
   - `ChevronDown` para el botón principal
   - `ChevronRight` para subrubros con hijos (rota 90° al abrir)
4. **Funciona con infinitos niveles**: Mientras tu DB tenga la estructura, se renderizará

## Resultado visual:
```
Novedades ▼
  ├─ Promoción ▶
  │   ├─ Hombre
  │   └─ Mujer
  └─ Temporada ▶
      └─ Verano */

// Datos de ejemplo
/* const productosEjemplo = [
    {
        id: 1,
        name: "Zapatillas Urban Style Pro",
        description: "Diseño moderno con tecnología de amortiguación avanzada",
        price: 12499,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"
    },
    {
        id: 2,
        name: "Reloj Smartwatch Elite",
        description: "Monitor de salud 24/7 con pantalla AMOLED",
        price: 24999,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
    },
    {
        id: 3,
        name: "Auriculares Premium ANC",
        description: "Cancelación de ruido activa de última generación",
        price: 18499,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
    },
    {
        id: 4,
        name: "Mochila Tech Travel",
        description: "Compartimento para laptop con puerto USB integrado",
        price: 8999,
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"
    },
    {
        id: 5,
        name: "Cámara Mirrorless 4K",
        description: "Sensor full frame con estabilización en 5 ejes",
        price: 89999,
        imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop"
    },
    {
        id: 6,
        name: "Lámpara LED Inteligente",
        description: "16 millones de colores controlados por app",
        price: 4599,
        imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop"
    }
]; */

export default async function YatayPage() {
    const subrubros = await getSubrubrosRecursive(null, rubro);
    const news = await getNews(rubro, 12);
    /* console.log("🚀 ~ YatayPage ~ news:", news) */

    return (
        <>
            <Carrousel
                rubro={rubro}
                images={imagesYatay}
                title={yatayTitle}
                yatayLogo={yatayLogo}
                subrubros={subrubros}
            />

            <NewsCarrousel productos={news} />
        </>
    )
}