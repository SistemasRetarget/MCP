import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Nosotros | Pueblo La Dehesa",
  description: "La historia detrás de Pueblo La Dehesa: inspirados en la vida de pueblo, la naturaleza y la calma. Un lugar donde la vida se siente calma y con propósito.",
  alternates: { canonical: "/nosotros" },
  openGraph: {
    title: "Nosotros | Pueblo La Dehesa",
    description: "La historia detrás de Pueblo: naturaleza, diseño y comunidad.",
    type: "website",
    locale: "es_CL",
    url: "/nosotros",
  },
};

const TESTIMONIALS = [
  {
    quote: "Propusimos una arquitectura elevada… para que el lugar, la luz y la cordillera dialoguen.",
    author: "Equipo de Arquitectura",
    role: "Diseño",
  },
  {
    quote: "Elegimos especies nativas y flores, diseñando un verde que se recorre, se vive y se cuida, acompañado por la cordillera.",
    author: "Equipo de Paisajismo",
    role: "Paisaje",
  },
  {
    quote: "Pensamos interiores cálidos, nobles y simples. Espacios que se sienten bien y dan ganas de habitar.",
    author: "Juan Ignacio Court",
    role: "Interiorismo",
  },
  {
    quote: "Acompañamos cada estadía con atención y cariño, para que desde el primer día se sientan en casa.",
    author: "Maureen Morrison",
    role: "Experiencia Pueblo",
    image: "https://puebloladehesa.cl/cdn/shop/files/Maureen_Morrison_2025-12-18_at_20.34.05.jpg",
  },
];

const INSPIRACION = [
  {
    icon: "🏘️",
    title: "La vida de pueblo",
    text: "Los encuentros espontáneos, los gestos cotidianos, el centro que reúne.",
  },
  {
    icon: "🌳",
    title: "La naturaleza como escenario",
    text: "Parques de árboles nativos, pasarelas y la cordillera siempre presente.",
  },
  {
    icon: "🚶",
    title: "Un ritmo más tranquilo",
    text: "Días pensados para caminar, encontrarse y vivir sin apuro.",
  },
  {
    icon: "🪵",
    title: "El diseño bien pensado",
    text: "Espacios simples, honestos y cuidados, que se integran al entorno y a la vida diaria.",
  },
];

export default function Nosotros() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image
          src="https://puebloladehesa.cl/cdn/shop/files/13-SJEvsinba-5926_459bc3b3-d100-475d-9bf3-1fb4303ac966.png"
          alt="Pueblo La Dehesa - Nosotros"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Nosotros</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            La historia detrás de Pueblo
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light italic">
            Inspirados en la vida de pueblo, la naturaleza y la calma.
          </p>
        </div>
      </section>

      {/* Pregunta Manifiesto */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          ¿Y si bajar el ritmo no implicara irse de la ciudad?
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          Hoy vivimos rodeados de ruido, tránsito y prisa. Pero todos buscamos, consciente o
          inconscientemente, un lugar donde ese ritmo pueda cambiar. Ahí comienza Pueblo.
        </p>
      </section>

      {/* Quote arquitectura */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-tight italic">
            "Propusimos una arquitectura elevada... para que el lugar, la luz y la cordillera dialoguen"
          </p>
        </div>
      </section>

      {/* Volver a lo esencial */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/Inmersion_naturaleza_07A8225.png"
              alt="Volver a lo esencial"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
              Volver a lo esencial
            </h2>
            <p className="text-lg text-brand-muted leading-relaxed mb-4">
              Pueblo nace de una idea simple y poderosa: crear un lugar donde la vida se sienta
              calma y con propósito.
            </p>
            <p className="text-lg text-brand-muted leading-relaxed mb-2">
              Imaginamos una forma de vivir más simple, inspirada en la vida de pueblo.
            </p>
            <ul className="mt-6 space-y-2 text-brand-muted">
              <li className="flex items-start gap-3">
                <span className="text-brand-accent">•</span> Caminar sin apuro
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-accent">•</span> Mirar y sentir la cordillera
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-accent">•</span> Dejar que el entorno acompañe
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quote paisajismo */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-tight italic">
            "Elegimos especies nativas y flores, diseñando un verde que se recorre, se vive y se cuida,
            acompañado por la cordillera"
          </p>
        </div>
      </section>

      {/* Inspiración - 4 pillars */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Nuestra inspiración
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {INSPIRACION.map((p) => (
            <div key={p.title} className="text-center">
              <div className="text-5xl mb-6">{p.icon}</div>
              <h3 className="font-serif text-xl font-light mb-3">{p.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quote interiores */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-tight italic">
            "Pensamos interiores cálidos, nobles y simples. Espacios que se sienten bien y dan ganas de habitar"
          </p>
          <p className="mt-6 text-sm uppercase tracking-widest text-brand-muted">
            — Juan Ignacio Court
          </p>
        </div>
      </section>

      {/* Arquitectura + Comunidad — 1 sola sección con 2 bloques (match PROD section count) */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
                Arquitectura que dialoga con el entorno
              </h2>
              <p className="text-brand-muted leading-relaxed text-lg">
                Cada casa fue pensada para integrarse al paisaje, abrir vistas hacia la cordillera
                y permitir que la luz natural marque el ritmo del día. Los volúmenes elevados
                respetan los árboles y dejan que el verde permee los espacios comunes.
              </p>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg order-first md:order-last">
              <Image
                src="https://puebloladehesa.cl/cdn/shop/files/07A0209.png"
                alt="Arquitectura Pueblo La Dehesa"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src="https://puebloladehesa.cl/cdn/shop/files/07A9367_e8ee6dc7-4908-4583-8fc6-1a5c051fc60f.jpg"
                alt="Comunidad Pueblo"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
                Una comunidad que se cuida
              </h2>
              <p className="text-brand-muted leading-relaxed text-lg">
                La vida en Pueblo se construye en lo cotidiano: el café compartido en La Casita,
                las caminatas al atardecer, los encuentros espontáneos en los parques. Cuidamos
                cada detalle del entorno para que el día a día se sienta natural y conectado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Las voces detrás de Pueblo
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t, i) => {
            const tImg = (t as { image?: string }).image;
            return (
              <div key={i} className="bg-white border border-brand-line rounded-lg p-8 flex gap-6 items-start">
                {tImg && (
                  <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={tImg}
                      alt={t.author}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-serif text-lg font-light italic leading-relaxed mb-6">
                    “{t.quote}”
                  </p>
                  <p className="text-sm font-semibold text-brand-ink">{t.author}</p>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mt-1">{t.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
            Vive la experiencia Pueblo
          </h3>
          <p className="text-lg opacity-90 mb-8">
            Reserva tu estadía y descubre por qué este lugar es único
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
            >
              Reservar Ahora
            </a>
            <Link href="/contacto" className="inline-block border border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-ink transition-colors">
              Contáctanos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
