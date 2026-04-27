import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listHouses, imageForPage } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Estadías | Pueblo La Dehesa",
  description: "Estadías flexibles en espacios pensados para descansar y sentirse en casa. Tu propio espacio con vista a la montaña, rodeado de jardines y un gran parque.",
  alternates: { canonical: "/estadias" },
  openGraph: {
    title: "Estadías | Pueblo La Dehesa",
    description: "Casas amobladas con vista a la cordillera. 4 tipologías para hasta 4 personas.",
    type: "website",
    locale: "es_CL",
    url: "/estadias",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Pueblo La Dehesa — Estadías" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] }
};

const SERVICIOS = [
  {
    title: "Limpieza diaria",
    description: "Mantén tu espacio impecable durante toda tu estadía",
    icon: "✨"
  },
  {
    title: "Conserjería 24/7",
    description: "Atención personalizada cuando la necesites",
    icon: "🛎️"
  },
  {
    title: "WiFi de alta velocidad",
    description: "Conectividad para trabajar o disfrutar",
    icon: "📡"
  },
  {
    title: "Estacionamiento privado",
    description: "Espacio seguro para tu vehículo",
    icon: "🚗"
  },
  {
    title: "Acceso a La Casita",
    description: "Salón gourmet exclusivo para huéspedes",
    icon: "☕"
  },
  {
    title: "Experiencias incluidas",
    description: "Caminatas, yoga y actividades en el parque",
    icon: "🌿"
  }
];

export default function EstadiasPrincipal() {
  const houses = listHouses("es");

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image
          src="https://puebloladehesa.cl/cdn/shop/files/07A0142.jpg"
          alt="Estadías Pueblo La Dehesa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">
            Estadías
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight max-w-4xl">
            Espacios pensados para descansar y sentirse en casa
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">
          Aquí lo cotidiano se vuelve especial
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          Tu propio espacio con vista a la montaña, rodeado de jardines, pasarelas y un gran parque.
          Una nueva forma de habitar lo esencial.
        </p>
      </section>

      {/* Houses Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Explora los diferentes lugares que tenemos para ti
          </h2>
          <p className="text-lg text-brand-muted max-w-3xl mx-auto">
            Contamos con diferentes tipologías de 1 y 2 habitaciones, pensadas para hasta 4 personas,
            todas completamente equipadas, con terrazas privadas y vistas despejadas a la cordillera.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const img = imageForPage(key);
            const slug = h.path.split("/").pop();
            return (
              <Link
                key={h.path}
                href={`/casas/${slug}`}
                className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-soft">
                  <Image
                    src={img}
                    alt={h.meta.title || "Casa"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 bg-white">
                  <h3 className="font-serif text-2xl font-light">{h.meta.title?.split("|")[0].trim() || "Casa"}</h3>
                  <p className="mt-2 text-sm text-brand-muted line-clamp-2">
                    {h.meta.description || ""}
                  </p>
                  <div className="mt-4 inline-flex text-xs font-semibold text-brand-accent uppercase tracking-wider">
                    Ver más →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Services */}
      <section className="bg-brand-soft py-24 mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Todo lo que necesitas... sin preocuparte de nada
            </h2>
            <p className="text-lg text-brand-muted max-w-3xl mx-auto">
              Quedarte en Pueblo es más que tener un espacio único: es acceder a servicios y experiencias
              que conectan con el entorno. Desde lo cotidiano hasta paseos y experiencias de turismo,
              todo está pensado para vivir con más calma y aprovechar mejor tu tiempo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICIOS.map((s) => (
              <div key={s.title} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-semibold text-brand-ink mb-2">{s.title}</h3>
                <p className="text-sm text-brand-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de Estadía */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Distintas formas de habitar lo esencial
          </h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Elige entre nuestras estadías de corto-mediano o largo plazo en nuestras 4 tipologías de casa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-8 rounded-lg border border-brand-line">
            <h3 className="font-serif text-2xl font-light mb-3">Por temporada</h3>
            <p className="text-sm text-brand-muted mb-6">
              Estadías de pocos días para vacacionar o descubrir Pueblo
            </p>
            <span className="inline-block text-xs font-semibold text-brand-accent uppercase tracking-wider">
              Corto plazo
            </span>
          </div>
          <div className="text-center p-8 rounded-lg border-2 border-brand-accent bg-brand-soft">
            <h3 className="font-serif text-2xl font-light mb-3">Mensual</h3>
            <p className="text-sm text-brand-muted mb-6">
              Una nueva forma de habitar la ciudad, mes a mes
            </p>
            <span className="inline-block text-xs font-semibold text-brand-accent uppercase tracking-wider">
              Mediano plazo
            </span>
          </div>
          <div className="text-center p-8 rounded-lg border border-brand-line">
            <h3 className="font-serif text-2xl font-light mb-3">Anual</h3>
            <p className="text-sm text-brand-muted mb-6">
              Tu hogar permanente en Pueblo La Dehesa
            </p>
            <span className="inline-block text-xs font-semibold text-brand-accent uppercase tracking-wider">
              Largo plazo
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
            ¿Listo para tu estadía?
          </h3>
          <p className="text-lg opacity-90 mb-8">
            Reserva tu casa ahora y vive la experiencia de Pueblo La Dehesa
          </p>
          <a
            href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
          >
            Reservar Ahora
          </a>
        </div>
      </section>
    </>
  );
}
