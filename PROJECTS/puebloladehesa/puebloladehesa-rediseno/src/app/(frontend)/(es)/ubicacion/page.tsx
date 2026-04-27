import type { Metadata } from "next";
import Image from "next/image";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ubicación | Pueblo La Dehesa",
  description: "Pueblo La Dehesa: cerca de todo, en un entorno de silencio. Ubicado en un sector residencial de La Dehesa con excelente conectividad y entorno natural privilegiado.",
  alternates: { canonical: "/ubicacion" },
  openGraph: {
    title: "Ubicación | Pueblo La Dehesa",
    description: "33.367° S, 70.530° O — En el corazón del valle de La Dehesa",
    type: "website",
    locale: "es_CL",
    url: "/ubicacion",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Pueblo La Dehesa — Ubicación" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] }
};

const NEARBY_PLACES = [
  {
    title: "Acceso Costanera Norte",
    description: "Conectividad rápida con el resto de Santiago",
    icon: "🛣️",
    time: "5 min"
  },
  {
    title: "Centros comerciales y restaurantes",
    description: "El Golf, Nueva Las Condes",
    icon: "🛍️",
    time: "10 min"
  },
  {
    title: "Barrios de oficinas",
    description: "El Golf, Nueva Las Condes",
    icon: "🏢",
    time: "10 min"
  },
  {
    title: "Colegios",
    description: "Newland, Santiago College, Nido de Águilas",
    icon: "🎓",
    time: "3 a 10 min"
  },
  {
    title: "Parques y Cerros",
    description: "Cerro Manquehue, Manquehuito, El Durazno",
    icon: "⛰️",
    time: "5 min"
  },
  {
    title: "Plazas y pumtrack",
    description: "Espacios para deporte y recreación",
    icon: "🌳",
    time: "5 min"
  },
  {
    title: "Centros de esquí",
    description: "Valle Nevado, La Parva, El Colorado",
    icon: "⛷️",
    time: "1.5 hrs"
  },
  {
    title: "Helipuerto cercano",
    description: "Experiencias en helicóptero para nuestros huéspedes",
    icon: "🚁",
    time: "4 min"
  }
];

export default function Ubicacion() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image
          src="https://puebloladehesa.cl/cdn/shop/files/07A1915.jpg"
          alt="Ubicación Pueblo La Dehesa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">
            33.367° S, 70.530° O
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Ubicación
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            En el corazón del valle de La Dehesa
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Cerca de todo, en un entorno de silencio
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Pueblo La Dehesa está ubicado en un sector residencial de La Dehesa,
          con excelente conectividad y un entorno natural privilegiado.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          Su ubicación permite estar cerca de los principales accesos, servicios
          y equipamientos del sector, sin renunciar al silencio, las vistas
          y la sensación de vivir rodeado de naturaleza.
        </p>
      </section>

      {/* Map and Address */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-serif text-3xl font-light mb-6">Cómo Llegar</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-brand-ink mb-2">Dirección</h4>
                <p className="text-brand-muted">
                  Pueblo La Dehesa, La Dehesa, Santiago, Región Metropolitana, Chile
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-brand-ink mb-2">Coordenadas</h4>
                <p className="text-brand-muted font-mono text-sm">
                  33.367° S, 70.530° O
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-brand-ink mb-2">Desde el centro de Santiago</h4>
                <p className="text-brand-muted">
                  25-30 minutos en auto vía Costanera Norte. Un oasis de tranquilidad a solo minutos de la ciudad.
                </p>
              </div>

              <div className="pt-6 border-t border-brand-line">
                <a
                  href="https://maps.google.com/?q=Pueblo+La+Dehesa+Santiago"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-brand-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
                >
                  Abrir en Google Maps →
                </a>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] rounded-lg overflow-hidden bg-brand-soft">
            <iframe
              src="https://maps.google.com/maps?q=Santa+Blanca+550+Lo+Barnechea+Santiago&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Mapa Pueblo La Dehesa"
            />
          </div>
        </div>
      </section>

      {/* Nearby Places Grid */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
              Qué Encontrarás Cerca
            </h2>
            <p className="text-lg text-brand-muted max-w-2xl mx-auto">
              Conectividad, naturaleza y servicios al alcance de tu estadía
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEARBY_PLACES.map((place) => (
              <div key={place.title} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{place.icon}</div>
                <h3 className="font-semibold text-brand-ink mb-2">{place.title}</h3>
                <p className="text-sm text-brand-muted mb-3">{place.description}</p>
                <p className="text-xs font-semibold text-brand-accent uppercase tracking-wider">
                  {place.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
          Visítanos en Pueblo La Dehesa
        </h3>
        <p className="text-lg text-brand-muted mb-8">
          Reserva tu estadía y descubre por qué este lugar es único
        </p>
        <a
          href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-brand-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
        >
          Reservar Ahora
        </a>
      </section>
    </>
  );
}
