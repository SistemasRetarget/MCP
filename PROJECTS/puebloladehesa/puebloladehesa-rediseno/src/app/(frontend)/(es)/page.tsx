import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPage, listHouses, imageForPage, extractParagraphs } from "@/lib/content";
import Features from "@/components/sections/Features";
// import Testimonials from "@/components/Testimonials";
// import FAQ from "@/components/FAQ";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pueblo La Dehesa | Casas de Lujo en La Dehesa, Santiago",
  description: "Descubre casas rodeadas de naturaleza en La Dehesa. Diseño, calma y refugio en la ciudad. Conoce nuestras propiedades exclusivas.",
  keywords: "casas La Dehesa, propiedades Santiago, casas lujo, arrendamiento casas",
  openGraph: {
    title: "Pueblo La Dehesa | Casas de Lujo en La Dehesa",
    description: "Casas rodeadas de naturaleza, diseño y calma en La Dehesa.",
    type: "website",
    locale: "es_CL",
    url: "https://puebloladehesa.cl"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pueblo La Dehesa | Casas de Lujo en La Dehesa",
    description: "Casas rodeadas de naturaleza, diseño y calma en La Dehesa."
  }
};

export default function Home() {
  const home = getPage("es", "home");
  const houses = listHouses("es");
  const heroImg = home ? imageForPage("es__home", "/media//media/placeholder.svg") : "/media//media/placeholder.svg";
  const intro = home ? extractParagraphs(home, 2)[0] : "";

  return (
    <>
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden -mt-20 lg:-mt-24">
        <img
          src={heroImg}
          alt="Pueblo La Dehesa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Tu refugio en la ciudad
          </h1>
          <p className="mt-4 text-base md:text-lg max-w-2xl opacity-95">
            Arriendo de casas amobladas inmersas en la naturaleza con vistas a la cordillera y al valle de la Dehesa.
          </p>
        </div>
      </section>

      {/* SECTION 2: Rich text — narrativa de marca (matches prod section 3) */}
      <section className="py-section bg-brand-soft">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-brand-ink leading-tight">
            Pueblo nace de la idea de volver a lo esencial.
          </h2>
          <p className="mt-6 text-brand-muted leading-relaxed text-lg">
            Un lugar donde la naturaleza, el diseño y la calma se cruzan para crear un nuevo sentido de habitar la ciudad. Aquí cada casa se piensa como un refugio integrado al entorno, con la cordillera como horizonte y el ritmo del valle como telón de fondo.
          </p>
        </div>
      </section>

      {/* SECTION 3: Tres Pilares (Features) — matches prod section 4 */}
      <Features locale="es" />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 font-light">Un lugar para quedarte el tiempo que necesites</h2>
            <div className="space-y-5 text-brand-muted leading-relaxed text-lg">
              <p>
                Arriendo de casas amobladas integradas al paisaje, con luz natural y vistas a la cordillera.
              </p>
              <p>
                Como en todo pueblo, hay un punto de encuentro: La Casita, un espacio para un café, algo rico para comer, para trabajar con calma o simplemente cruzarse con otros de manera natural.
              </p>
              <p>
                Con un equipo atento, arriendo flexible y una ubicación privilegiada —cerca de todo, envuelta en silencio— Pueblo propone una forma de vivir simple, conectada y tranquila desde el primer día.
              </p>
            </div>
          </div>
          <div className="relative h-[480px] overflow-hidden bg-brand-soft hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://puebloladehesa.cl/cdn/shop/files/Locacion_AEREA_1_1_38dd9d39-992c-4897-9b6f-cd9711ae23fb.webp"
              alt="Vista panorámica del valle de La Dehesa"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: Espacios para quedarse — 4 columnas horizontales matching prod */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl mb-4 font-light">Espacios para quedarse</h2>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto">
            Cada casa propone una experiencia distinta, unida por la luz, el diseño y la calma del entorno.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              slug: "casa-doble-altura",
              name: "Casa Doble Altura",
              specs: "2 HABITACIONES / 2,5 BAÑOS",
              desc: "Dos niveles y doble altura, pensada para vivir con mayor amplitud y privacidad entre ambientes.",
              img: "https://puebloladehesa.cl/cdn/shop/files/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6_1.webp",
            },
            {
              slug: "casa-parque",
              name: "Casa Parque",
              specs: "2 HABITACIONES / 2 BAÑOS",
              desc: "Un primer piso que se abre al parque, con la terraza como extensión natural de la casa.",
              img: "https://puebloladehesa.cl/cdn/shop/files/07A9319_9e57ed7b-b137-4536-ae8e-abfc85a8aeec_1.webp",
            },
            {
              slug: "casa-panoramica",
              name: "Casa Panorámica",
              specs: "2 HABITACIONES / 2 BAÑOS",
              desc: "Un segundo piso con vistas abiertas a la cordillera y mayor sensación de perspectiva.",
              img: "https://puebloladehesa.cl/cdn/shop/files/07A0248.jpg",
            },
            {
              slug: "casa-suite",
              name: "Casa Suite",
              specs: "1 HABITACIÓN / 1,5 BAÑOS",
              desc: "Un dormitorio, con la mayor amplitud interior y una experiencia más abierta y protagónica.",
              img: "https://puebloladehesa.cl/cdn/shop/files/IMG_0011_1.webp",
            },
          ].map((casa) => (
            <Link
              key={casa.slug}
              href={`/casas/${casa.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-brand-soft mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={casa.img}
                  alt={casa.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <h3 className="font-serif text-2xl font-light text-brand-ink mb-2">
                {casa.name}
              </h3>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">
                {casa.specs}
              </p>
              <p className="text-sm text-brand-muted leading-relaxed mb-4">
                {casa.desc}
              </p>
              <span className="inline-flex items-center text-sm text-brand-ink group-hover:text-brand-accent transition-colors">
                ver más →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 6: Promo bar Estadías flexibles — matches prod section 8 */}
      <section className="py-section bg-brand-ink text-white">
        <div className="max-w-container mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light">Estadías flexibles</h2>
              <p className="mt-3 text-white/80 text-lg max-w-2xl">
                Reserva para nuestras estadías de corto, mediano y largo plazo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/estadias" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-brand-accent text-white font-medium hover:bg-brand-accent/90 transition-colors">
                Reservar
              </Link>
              <Link href="/contacto" className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 transition-colors">
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Experiencias que le dan vida a Pueblo — header + carousel */}
      <section className="bg-brand-soft py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12">
            <div className="max-w-3xl">
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-brand-ink leading-tight mb-6">
                Experiencias que le dan vida a Pueblo
              </h2>
              <p className="text-brand-muted text-lg leading-relaxed">
                Además de disfrutar en Pueblo, organizamos experiencias en tres mundos —naturaleza,
                pausa y comunidad— que nacen en Pueblo y se expanden hacia su entorno: desde
                caminatas, clases de yoga, hasta exploraciones que conectan la cordillera, los
                centros de ski y la costa.
              </p>
            </div>
            <Link
              href="/experiencias"
              className="hidden lg:inline-flex items-center gap-3 text-sm uppercase tracking-widest text-brand-ink hover:text-brand-accent transition-colors whitespace-nowrap"
            >
              Ver todas <span className="text-2xl">→</span>
            </Link>
          </div>

          {/* Carousel grid - 4 cards visibles, match PROD experiencias gallery */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "https://puebloladehesa.cl/cdn/shop/files/Cabalgata.png", tag: "Naturaleza", title: "Cabalgatas al atardecer" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/trekking_1.webp", tag: "Naturaleza", title: "Trekking en cordillera" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/Jardin_07A9818_1.webp", tag: "Pausa", title: "Jardín y silencio" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/vida_en_comunidad_07A0078_1_7bdc8b09-9b68-4924-a72c-3bea87f72e31.webp", tag: "Comunidad", title: "Vida compartida" },
            ].map((exp, i) => (
              <div key={i} className="relative aspect-[3/4] overflow-hidden bg-brand-soft group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exp.src}
                  alt={exp.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs uppercase tracking-widest text-white/80 mb-1">{exp.tag}</p>
                  <p className="font-serif text-lg text-white font-light leading-tight">{exp.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-10 text-center lg:hidden">
            <Link
              href="/experiencias"
              className="inline-flex items-center gap-3 text-sm uppercase tracking-widest text-brand-ink hover:text-brand-accent transition-colors"
            >
              Ver todas las experiencias <span className="text-2xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: Quote parallax full-width — matches prod */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://puebloladehesa.cl/cdn/shop/files/07A1871_870b59a3-cea5-46af-a04f-16711cf0bdd6_1.webp"
          alt="Pueblo La Dehesa con vista a la cordillera"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
        <div className="relative h-full flex items-center px-6 lg:px-16">
          <div className="max-w-2xl">
            <p className="font-serif text-3xl md:text-4xl lg:text-5xl text-white font-light leading-tight">
              La vida de pueblo que hoy buscamos, con naturaleza y calma, sin salir de la ciudad
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8.5: Vida en Pueblo — 3-photo grid match PROD */}
      <section className="py-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">Vida en Pueblo</h2>
            <p className="text-brand-muted max-w-2xl mx-auto">
              Espacios pensados para habitar con calma, integrados al paisaje de La Dehesa.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0373_1_9306cd35-d2d4-4c49-b3de-55aa005f487c.webp", alt: "Interior con vista" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A0374_1.webp", alt: "Vista a la cordillera" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/07A9353_1_1.webp", alt: "Terraza y parque" },
              { src: "https://puebloladehesa.cl/cdn/shop/files/Masterplan_1.webp", alt: "Masterplan Pueblo La Dehesa" },
            ].map((img, i) => (
              <div key={i} className="relative aspect-[4/5] overflow-hidden bg-brand-soft group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: Inline contact form — matches prod section 11 */}
      <section className="py-section">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-4xl md:text-5xl font-light text-brand-ink">Estamos aquí para ayudarte</h2>
            <p className="mt-3 text-brand-muted leading-relaxed">
              Si quieres conocer más detalles o coordinar una visita, escríbenos.
            </p>
          </div>
          <form action="/api/contact" method="POST" className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input name="name" required placeholder="Nombre" className="w-full px-4 py-3 border border-brand-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent" />
              <input name="email" type="email" required placeholder="Correo electrónico" className="w-full px-4 py-3 border border-brand-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent" />
            </div>
            <input name="phone" type="tel" placeholder="Teléfono" className="w-full px-4 py-3 border border-brand-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent" />
            <textarea name="message" required rows={4} placeholder="Mensaje" className="w-full px-4 py-3 border border-brand-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent" />
            <button type="submit" className="justify-self-start px-8 py-4 rounded-full bg-brand-accent text-white font-medium hover:bg-brand-accent/90 transition-colors">
              Enviar mensaje
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 10: Feature bar — matches prod section 12 */}
      <section className="py-section-sm border-t border-brand-line bg-brand-bg">
        <div className="max-w-container mx-auto px-6 lg:px-10">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Reserva</p>
              <p className="font-serif text-lg text-brand-ink">Arriendos por semanas o meses</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Entorno</p>
              <p className="font-serif text-lg text-brand-ink">Barrio seguro y silencioso</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Paisaje</p>
              <p className="font-serif text-lg text-brand-ink">Vistas a la cordillera</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Calidad de vida</p>
              <p className="font-serif text-lg text-brand-ink">Aire limpio y naturaleza</p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
