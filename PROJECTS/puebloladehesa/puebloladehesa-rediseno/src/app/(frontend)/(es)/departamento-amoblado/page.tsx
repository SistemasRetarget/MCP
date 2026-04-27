import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Arriendo Departamento Amoblado | Pueblo La Dehesa",
  description: "Departamentos amoblados con vista a la cordillera en La Dehesa, Santiago. Soluciones flexibles, completamente equipadas y servicio incluido.",
  openGraph: {
    title: "Departamento Amoblado | Pueblo La Dehesa",
    description: "Casas amobladas inmersas en la naturaleza con vistas a la cordillera",
    type: "website",
    locale: "es_CL",
  },
};

export default function DepartamentoAmoblado() {
  return (
    <>
      <section className="relative h-[60vh] min-h-[450px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src={shopifyImages.casaPanoramica.hero} alt="Departamento Amoblado" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Estadías</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight max-w-4xl">
            Departamento Amoblado
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Casas amobladas inmersas en la naturaleza con vistas a la cordillera y al valle de La Dehesa
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Descubre Pueblo La Dehesa
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Hay muchas razones por las que puedes estar buscando el arriendo departamento amoblado:
          una remodelación profunda de tu vivienda, un proceso temporal de cambio de vida o trabajo,
          o simplemente entender qué es lo que quieres para tu siguiente etapa.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Nosotros estamos aquí para brindarte soluciones flexibles y cómodas. Contamos con unidades
          completamente equipadas, servicio de limpieza (diario o semanal) y opciones de desayuno.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          Estamos preparados para tu situación, ya sea un arriendo temporal de un par de días
          o algo más alargado. Nos adaptamos a ti.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src={shopifyImages.experiencias.cabalgata}
                alt="Experiencias en Pueblo La Dehesa"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
                Un lugar para vivir Experiencias
              </h3>
              <p className="text-lg text-brand-muted leading-relaxed mb-4">
                Clases de yoga, tardes de trekking, talleres, momentos de encuentro y mucho más.
                Todo a pasos de tu unidad. Esto es parte de lo que nos hace únicos.
              </p>
              <p className="text-lg text-brand-muted leading-relaxed">
                Si tienes que vivir en la ciudad por temas logísticos, pero quieres desconectar
                cuando termina el trabajo: ven a conocer Pueblo La Dehesa.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
          Vive la naturaleza, la tranquilidad y la calidez de un pueblo comunidad
        </h3>
        <p className="text-lg text-brand-muted mb-8">
          Sin alejarte de la accesibilidad que presenta Santiago
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
          <Link href="/contacto" className="inline-block border border-brand-ink text-brand-ink px-8 py-3 rounded-lg font-semibold hover:bg-brand-ink hover:text-white transition-colors">
            Contactar
          </Link>
        </div>
      </section>
    </>
  );
}
