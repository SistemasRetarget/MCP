import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Arriendo por Temporada | Pueblo La Dehesa",
  description: "Arriendo por temporada flexible en Pueblo La Dehesa. Casas amobladas para estadías de pocos días o semanas, ideal para proyectos, remodelaciones o transiciones.",
  openGraph: {
    title: "Arriendo por Temporada | Pueblo La Dehesa",
    description: "Flexibilidad y comodidad para tu estadía corta",
    type: "website",
    locale: "es_CL",
  },
};

export default function Temporada() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[450px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src={shopifyImages.casaParque.hero} alt="Arriendo por Temporada" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Estadías</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Arriendo por Temporada
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Nos adaptamos a tus necesidades
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Arriendos Flexibles por Temporada
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Contamos con casas amobladas que te permitirán pasar la cantidad de tiempo que necesites.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          Si no vives en Santiago pero debes pasar una temporada por un proyecto o un caso especial
          en el trabajo, tenemos la solución a tus necesidades.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="font-serif text-2xl font-light mb-4">¿Necesitas una remodelación extendida?</h3>
              <p className="text-brand-muted leading-relaxed">
                En caso de que estés rediseñando la cocina o baños, puede ser muy desagradable
                quedarte en tu hogar habitual. Pueblo La Dehesa es tu refugio temporal.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-serif text-2xl font-light mb-4">¿Cambio de vivienda con calzas?</h3>
              <p className="text-brand-muted leading-relaxed">
                ¿No calza el periodo de salida de tu vivienda con el periodo de entrega de tu próxima
                ubicación? ¡No te compliques! Pueblo La Dehesa es una alternativa flexible.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-6">
          Cerca de todo, pero envuelto en silencio
        </h2>
        <p className="text-lg text-brand-muted mb-8">
          Estamos para ayudarte, contacta con nosotros para buscar una solución que se ajuste a tus necesidades.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
          >
            Reservar Ahora
          </a>
          <Link
            href="/contacto"
            className="inline-block border border-brand-ink text-brand-ink px-8 py-3 rounded-lg font-semibold hover:bg-brand-ink hover:text-white transition-colors"
          >
            Contactar
          </Link>
        </div>
      </section>
    </>
  );
}
