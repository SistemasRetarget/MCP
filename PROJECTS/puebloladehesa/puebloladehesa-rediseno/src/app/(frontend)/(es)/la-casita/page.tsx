import type { Metadata } from "next";
import Image from "next/image";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "La Casita Salón Gourmet | Pueblo La Dehesa",
  description: "La Casita: el corazón de Pueblo La Dehesa. Un espacio exclusivo para nuestros huéspedes donde el café, la comida y los encuentros cotidianos completan la experiencia Pueblo.",
  alternates: { canonical: "/la-casita" },
  openGraph: {
    title: "La Casita | Pueblo La Dehesa",
    description: "Salón Gourmet y punto de encuentro exclusivo para huéspedes",
    type: "website",
    locale: "es_CL",
    url: "/la-casita",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Pueblo La Dehesa — La Casita Salón Gourmet" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] }
};

export default function LaCasita() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <img
          src="https://puebloladehesa.cl/cdn/shop/files/07A9898.jpg"
          alt="La Casita Salón Gourmet"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Salón Gourmet</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            La Casita
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Tu refugio en Pueblo
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Como en todo pueblo, existe un lugar para reunirse.
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          En Pueblo, ese lugar es <em>La Casita</em>. Un espacio exclusivo para nuestros huéspedes,
          donde el café, algo rico para comer y los encuentros cotidianos le dan vida al día a día
          y completan la experiencia Pueblo.
        </p>
      </section>

      {/* Three Pillars */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10">
                <span className="text-3xl">☕</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-4">Un lugar de encuentro</h3>
              <p className="text-brand-muted">
                Pequeños instantes que convierten lo cotidiano en especial.
                Una taza caliente, una conversación, un lugar acogedor.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-4">Espacios de trabajo</h3>
              <p className="text-brand-muted">
                Conexión, calma y un ambiente inspirador para trabajar
                rodeado de naturaleza y lejos del ruido de la ciudad.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-4">Exclusivo para huéspedes</h3>
              <p className="text-brand-muted">
                Un espacio íntimo reservado para quienes se hospedan
                en Pueblo La Dehesa. Tu segundo hogar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Momentos Section — 6 imágenes en grid 2x3 */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Momentos en La Casita
          </h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Descubre sus rincones, sabores y la calidez que la hacen única.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-soft">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/pexels-kai-2055476840-29215602.jpg"
              alt="Desayuno en La Casita"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-soft">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/pexels-nicola-barts-7936960.jpg"
              alt="Huevos al desayuno"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-soft">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/07A1819.jpg"
              alt="Encuentros en La Casita"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-soft">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/145dd5ee93df3618d3d6929b49ad7334.jpg"
              alt="Café en La Casita"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-soft">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/Image_18_dic_2025_21_56_59.png"
              alt="Momentos compartidos"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-brand-soft">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/Terraza_La_Casita.png"
              alt="Detalles de La Casita"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
        </div>
        <p className="text-center text-xs text-brand-muted mt-6 italic">*Imágenes referenciales</p>
      </section>

      {/* Quote */}
      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl font-light italic leading-relaxed">
            "Pequeños instantes que convierten lo cotidiano en especial..."
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
          ¿Quieres vivir Pueblo?
        </h3>
        <p className="text-lg text-brand-muted mb-8">
          Reserva tu estadía y disfruta La Casita como parte de tu experiencia
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
          <a
            href="/contacto"
            className="inline-block border border-brand-ink text-brand-ink px-8 py-3 rounded-lg font-semibold hover:bg-brand-ink hover:text-white transition-colors"
          >
            Contactar
          </a>
        </div>
      </section>
    </>
  );
}
