import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { accommodationSchema, breadcrumbSchema } from "@/lib/schema";
import { CASAS, COMMON, listCasas } from "@/lib/casas-data";

export const revalidate = 3600;

export async function generateStaticParams() {
  return listCasas().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CASAS[slug];
  if (!c) return {};
  return {
    title: `${c.name} | Pueblo La Dehesa`,
    description: c.description[0],
    keywords: `${c.name}, casa amoblada La Dehesa, arrendamiento, ${c.beds}, ${c.baths}`,
    openGraph: {
      title: `${c.name} | Pueblo La Dehesa`,
      description: c.description[0],
      type: "website",
      locale: "es_CL",
      url: `https://puebloladehesa.cl/casas/${slug}`,
      images: [{ url: c.hero, alt: c.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${c.name} | Pueblo La Dehesa`,
      description: c.description[0],
      images: [c.hero],
    },
  } as Metadata;
}

export default async function CasaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const casa = CASAS[slug];
  if (!casa) notFound();

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56984046200";
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/";

  return (
    <article>
      <JsonLd
        data={accommodationSchema({
          name: casa.name,
          description: casa.description[0],
          slug: casa.slug,
          image: casa.hero,
          lang: "es",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", url: "/" },
          { name: "Estadías", url: "/estadias" },
          { name: casa.name, url: `/casas/${casa.slug}` },
        ])}
      />

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={casa.hero}
          alt={casa.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="relative h-full flex flex-col justify-end px-6 lg:px-16 pb-16">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-sm uppercase tracking-[0.3em] text-white/90 mb-3">
              Tipologías de Casa
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-tight">
              {casa.name}
            </h1>
            <p className="mt-3 text-white/90 text-lg">{casa.tagline}</p>
          </div>
        </div>
      </section>

      {/* STICKY CTA BAR */}
      <section className="sticky top-20 lg:top-24 z-30 bg-white border-b border-brand-line shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-brand-muted">
            <span className="hidden md:inline">{casa.surface}</span>
            <span className="hidden md:inline">·</span>
            <span>{casa.capacity}</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/contacto"
              className="px-6 py-2.5 border border-brand-ink text-brand-ink rounded-md hover:bg-brand-ink hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
            >
              Consultar disponibilidad
            </Link>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-brand-accent text-white rounded-md hover:bg-brand-accent/90 transition-colors text-sm font-medium uppercase tracking-wider"
            >
              Reservar ahora
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT - GALLERY + SIDEBAR */}
      <section className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* LEFT - Gallery vertical */}
          <div className="space-y-4">
            {casa.gallery.map((src, idx) => (
              <div key={idx} className="relative w-full overflow-hidden bg-brand-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${casa.name} - imagen ${idx + 1}`}
                  className="w-full h-auto block"
                  loading={idx < 2 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* RIGHT - Sticky info sidebar */}
          <aside className="lg:sticky lg:top-44 lg:self-start space-y-8">
            {/* Description */}
            <div>
              <h2 className="font-serif text-2xl font-light mb-4">Descripción</h2>
              {casa.description.map((p, i) => (
                <p key={i} className="text-brand-muted leading-relaxed mb-4">
                  {p}
                </p>
              ))}
            </div>

            {/* Specs */}
            <div className="border-t border-brand-line pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-muted mb-4">
                Especificaciones
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between border-b border-brand-line/50 pb-2">
                  <span className="text-brand-muted">Habitaciones</span>
                  <span className="text-brand-ink font-medium">{casa.beds}</span>
                </li>
                <li className="flex justify-between border-b border-brand-line/50 pb-2">
                  <span className="text-brand-muted">Baños</span>
                  <span className="text-brand-ink font-medium">{casa.baths}</span>
                </li>
                <li className="flex justify-between border-b border-brand-line/50 pb-2">
                  <span className="text-brand-muted">Capacidad</span>
                  <span className="text-brand-ink font-medium">{casa.capacity}</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span className="text-brand-muted">Superficie</span>
                  <span className="text-brand-ink font-medium text-right text-xs">{casa.surface}</span>
                </li>
              </ul>
            </div>

            {/* Amenities */}
            <div className="border-t border-brand-line pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-muted mb-4">
                Todo lo que necesitas, sin preocuparte de nada
              </h3>
              <ul className="space-y-3">
                {COMMON.amenities.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-ink">
                    <span className="text-brand-accent flex-shrink-0 mt-0.5">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* House Rules */}
            <div className="border-t border-brand-line pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-muted mb-4">
                Reglas de la casa
              </h3>
              <ul className="space-y-2 text-sm text-brand-muted">
                {COMMON.rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact CTAs */}
            <div className="border-t border-brand-line pt-6 space-y-3">
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola, me interesa la ${casa.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
              >
                💬 Consultar por WhatsApp
              </a>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full px-6 py-3 bg-brand-accent text-white rounded-md hover:bg-brand-accent/90 transition-colors font-medium"
              >
                Reservar ahora
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* OTHER HOUSES */}
      <section className="bg-brand-soft py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <h2 className="font-serif text-3xl font-light mb-8">Conoce nuestras otras tipologías</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listCasas()
              .filter((c) => c.slug !== casa.slug)
              .map((other) => (
                <Link key={other.slug} href={`/casas/${other.slug}`} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={other.hero}
                      alt={other.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-light text-brand-ink mb-1">
                    {other.name}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-brand-muted">{other.tagline}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </article>
  );
}
