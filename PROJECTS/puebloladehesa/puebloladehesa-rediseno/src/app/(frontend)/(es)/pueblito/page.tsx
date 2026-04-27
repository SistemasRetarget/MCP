import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pueblito | Pueblo La Dehesa",
  description: "Vive Santiago con la tranquilidad que no encontrarás en un hotel. Casas completamente equipadas en un entorno seguro, natural y exclusivo.",
  openGraph: {
    title: "Pueblito | Pueblo La Dehesa",
    description: "Tu hogar temporal en Santiago — más privado, más cómodo, más flexible que un hotel",
    type: "website",
    locale: "es_CL",
  },
};

const VENTAJAS = [
  "Casas completamente equipadas",
  "Espacios amplios y privados",
  "Vistas únicas todos los días",
  "Barrio residencial exclusivo",
  "Ideal para descanso o trabajo remoto",
  "Mejor relación precio/estadía larga",
  "Más espacio que una habitación",
  "Sin horarios de desayuno o comidas",
  "Más flexible para estadías largas",
];

const SERVICIOS = [
  { icon: "📡", text: "Internet de alta velocidad" },
  { icon: "🍳", text: "Cocina equipada con utensilios de alta calidad" },
  { icon: "🛏️", text: "Ropa de cama y servicios incluidos" },
  { icon: "🚕", text: "Servicio de Taxi, Uber y Cabify en la puerta" },
];

export default function Pueblito() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[450px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src={shopifyImages.casaSuite.hero} alt="Pueblito" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Alternativa Premium al Hotel</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Pueblito
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Vive Santiago con la tranquilidad que no encontrarás en un hotel
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Más que alojamiento: tu hogar temporal en Santiago
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Casas completamente equipadas en un entorno seguro, natural y exclusivo, a minutos
          de la ciudad.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          Sabemos que ya estás evaluando opciones para quedarte en Santiago. Aquí tienes una
          alternativa más cómoda, privada y flexible que un hotel.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">
              ¿Por qué elegir Pueblito por sobre un hotel?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VENTAJAS.map((v) => (
              <div key={v} className="flex items-start gap-3 bg-white rounded-lg p-5 shadow-sm">
                <span className="text-brand-accent text-xl flex-shrink-0">✓</span>
                <p className="text-brand-ink">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Todo listo para que solo llegues y disfrutes
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICIOS.map((s) => (
            <div key={s.text} className="text-center">
              <div className="text-4xl mb-3">{s.icon}</div>
              <p className="text-sm text-brand-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-4">
            ¿Prefieres una respuesta rápida?
          </h3>
          <p className="text-lg opacity-90 mb-8">
            Habla con nosotros por WhatsApp y recibe opciones disponibles hoy mismo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/56984046200"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 text-white px-10 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              💬 WhatsApp
            </a>
            <Link href="/contacto" className="inline-block border border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-ink transition-colors">
              Formulario de Contacto
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
