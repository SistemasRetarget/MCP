import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Experiencias | Pueblo La Dehesa",
  description: "Naturaleza, pausa y comunidad. Experiencias diarias y actividades organizadas en Pueblo La Dehesa: caminatas, yoga, trekking, helicóptero y más.",
  alternates: { canonical: "/experiencias" },
  openGraph: {
    title: "Experiencias | Pueblo La Dehesa",
    description: "Tres mundos para vivir Pueblo: Naturaleza, Pausa y Comunidad",
    type: "website",
    locale: "es_CL",
    url: "/experiencias",
  },
};

const ACTIVIDADES_NATURALEZA = [
  { name: "Caminatas guiadas", icon: "🥾" },
  { name: "Trekking", icon: "🏔️" },
  { name: "Paseos en helicóptero", icon: "🚁" },
  { name: "Cabalgatas", icon: "🐎" },
  { name: "Salidas al valle", icon: "🌄" },
];

const ACTIVIDADES_PAUSA = [
  { name: "Clases de yoga", icon: "🧘" },
  { name: "Meditación", icon: "🙏" },
  { name: "Talleres de relajación", icon: "✨" },
  { name: "Lectura en el parque", icon: "📖" },
  { name: "Contemplación", icon: "🌿" },
];

const ACTIVIDADES_COMUNIDAD = [
  { name: "Café en La Casita", icon: "☕" },
  { name: "Activaciones culturales", icon: "🎨" },
  { name: "Exposiciones", icon: "🖼️" },
  { name: "Encuentros con marcas", icon: "🤝" },
  { name: "Eventos privados", icon: "🥂" },
];

export default function Experiencias() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image
          src={shopifyImages.experiencias.cabalgata}
          alt="Experiencias Pueblo La Dehesa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">
            Experiencias en Pueblo La Dehesa
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight max-w-4xl">
            Más que un lugar
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Una forma de vivir experiencias todos los días
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">
          En Pueblo, creemos que la vida de un lugar no ocurre sola
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          Por eso, además de lo cotidiano que nace del entorno, organizamos y activamos
          experiencias que conectan con la naturaleza, el bienestar y la vida en comunidad.
        </p>
      </section>

      {/* Naturaleza */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg order-2 md:order-1">
              <Image
                src={shopifyImages.experiencias.trekking}
                alt="Naturaleza"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm uppercase tracking-widest text-brand-accent mb-4">
                Mundo 1
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
                Naturaleza: Explora lo que te rodea
              </h2>
              <p className="text-lg text-brand-muted leading-relaxed mb-4">
                Caminar por el parque, recorrer las pasarelas o salir a despejarte es parte
                de la vida diaria en Pueblo.
              </p>
              <p className="text-lg text-brand-muted leading-relaxed mb-6">
                A eso se suman experiencias outdoor que organizamos para ir más allá:
                caminatas guiadas, trekking, paseos en helicóptero y salidas que conectan
                la cordillera, los centros de esquí y el valle.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {ACTIVIDADES_NATURALEZA.map((a) => (
                  <li key={a.name} className="flex items-center gap-2 text-sm text-brand-muted">
                    <span>{a.icon}</span> {a.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pausa */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-brand-accent mb-4">
              Mundo 2
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Pausa: Conecta contigo
            </h2>
            <p className="text-lg text-brand-muted leading-relaxed mb-4">
              En Pueblo, bajar el ritmo también es parte de la experiencia. Leer, contemplar
              el paisaje o simplemente estar sucede de forma natural.
            </p>
            <p className="text-lg text-brand-muted leading-relaxed mb-6">
              Complementamos esa pausa con actividades de bienestar que activamos desde Pueblo:
              clases de yoga, meditación, relajación y talleres que ayudan a reconectar.
            </p>
            <ul className="grid grid-cols-2 gap-3">
              {ACTIVIDADES_PAUSA.map((a) => (
                <li key={a.name} className="flex items-center gap-2 text-sm text-brand-muted">
                  <span>{a.icon}</span> {a.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src={shopifyImages.experiencias.jardin}
              alt="Pausa"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Comunidad */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg order-2 md:order-1">
              <Image
                src={shopifyImages.vidaComunidad}
                alt="Comunidad"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm uppercase tracking-widest text-brand-accent mb-4">
                Mundo 3
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
                Comunidad: Comparte con otros
              </h2>
              <p className="text-lg text-brand-muted leading-relaxed mb-4">
                La vida de Pueblo se construye en los encuentros cotidianos: el café de la
                mañana, algo rico para comer, las conversaciones en el parque, los momentos
                que pasan sin agenda.
              </p>
              <p className="text-lg text-brand-muted leading-relaxed mb-6">
                Desde La Casita, impulsamos experiencias y encuentros que fortalecen la
                comunidad: activaciones culturales, exposiciones y colaboraciones con marcas.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {ACTIVIDADES_COMUNIDAD.map((a) => (
                  <li key={a.name} className="flex items-center gap-2 text-sm text-brand-muted">
                    <span>{a.icon}</span> {a.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Galería de momentos — bloque dentro de Comunidad (sin section wrapper para match PROD count) */}
      <div className="bg-brand-soft pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">
              Momentos en Pueblo
            </h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Una mirada a la vida cotidiana en Pueblo: paisajes, encuentros y experiencias.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0063.jpg", alt: "Vista del valle" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0156.jpg", alt: "Atardecer Pueblo" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0248.jpg", alt: "Casa Panor\u00e1mica" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0280.jpg", alt: "Parque interior" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0297.png", alt: "Detalle natural" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0374.jpg", alt: "Vista cordillera" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6.jpg", alt: "Casa con cordillera" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A9886.jpg", alt: "Senderos del pueblo" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/IMG_0153.jpg", alt: "Interior" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/IMG_0239.jpg", alt: "Espacio com\u00fan" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/IMG_3510.jpg", alt: "Habitaci\u00f3n" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/IMG_4674.jpg", alt: "Detalle de dise\u00f1o" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/IMG_7678.jpg", alt: "Vista exterior" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/Image_19_dic_2025_00_24_34.png", alt: "Momento Pueblo" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/leer.png", alt: "Leer en Pueblo" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/yoga.png", alt: "Yoga en Pueblo" },
            ].map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden bg-brand-soft group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
            Las experiencias que le dan vida a Pueblo
          </h3>
          <p className="text-lg opacity-90 mb-8">
            Reserva tu estadía y forma parte de nuestro calendario de actividades
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
