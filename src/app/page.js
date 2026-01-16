import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Darccuir - Mitad Izquierda */}
      <Link
        href="/darccuir"
        className="relative group w-full md:w-1/2 h-1/2 md:h-full overflow-hidden"
      >
        {/* Fondo con overlay oscuro */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1761868401/Portada_dwqomk.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />

        {/* Logo/Texto */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
          {/* <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider">
            DARCCUIR
          </h1> */}

          <Image
            src="https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1763697298/logo-darccuir-blanco_osmcmx.png"
            alt="Darccuir Logo"
            width={300}
            height={100}
            className="object-contain"
          />
        </div>
      </Link>

      {/* Yatay - Mitad Derecha */}
      <Link
        href="/yatay"
        className="relative group w-full md:w-1/2 h-1/2 md:h-full overflow-hidden"
      >
        {/* Fondo con overlay oscuro */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: "url('https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1760907717/Portada_jj6hb4.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />

        {/* Logo/Texto */}
        <div className="relative h-full flex flex-col items-center justify-center p-8 text-white">
          {/* <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-wider">
            YATAY
          </h1> */}

          <Image
            src="https://res.cloudinary.com/ddbhwo6fn/image/upload/f_auto,q_auto/v1763697294/logo-yatay-blanco_kxvqnz.png"
            alt="Yatay Logo"
            width={300}
            height={100}
            className="object-contain"
          />
        </div>
      </Link>
    </section>
  );
}