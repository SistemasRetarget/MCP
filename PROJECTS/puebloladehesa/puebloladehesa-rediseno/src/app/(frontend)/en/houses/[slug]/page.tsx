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
    title: `${c.nameEn} | Pueblo La Dehesa`,
    description: c.descriptionEn[0],
    keywords: `${c.nameEn}, furnished house La Dehesa, rental, ${c.bedsEn}`,
    openGraph: {
      title: `${c.nameEn} | Pueblo La Dehesa`,
      description: c.descriptionEn[0],
      type: "website",
      locale: "en_US",
      url: `https://puebloladehesa.cl/en/houses/${slug}`,
      images: [{ url: c.hero, alt: c.nameEn }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${c.nameEn} | Pueblo La Dehesa`,
      description: c.descriptionEn[0],
      images: [c.hero],
    },
  } as Metadata;
}

export default async function HousePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const casa = CASAS[slug];
  if (!casa) notFound();

  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56984046200";
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/";

  return (
    <article>
      <JsonLd
        data={accommodationSchema({
          name: casa.nameEn,
          description: casa.descriptionEn[0],
          slug: casa.slug,
          image: casa.hero,
          lang: "en",
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/en" },
          { name: "Stays", url: "/en/stays" },
          { name: casa.nameEn, url: `/en/houses/${casa.slug}` },
        ])}
      />

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={casa.hero}
          alt={casa.nameEn}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="relative h-full flex flex-col justify-end px-6 lg:px-16 pb-16">
          <div className="max-w-7xl mx-auto w-full">
            <p className="text-sm uppercase tracking-[0.3em] text-white/90 mb-3">
              House Typologies
            </p>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white font-light tracking-tight">
              {casa.nameEn}
            </h1>
            <p className="mt-3 text-white/90 text-lg">{casa.taglineEn}</p>
          </div>
        </div>
      </section>

      {/* STICKY CTA BAR */}
      <section className="sticky top-20 lg:top-24 z-30 bg-white border-b border-brand-line shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-brand-muted">
            <span className="hidden md:inline">{casa.surface}</span>
            <span className="hidden md:inline">·</span>
            <span>{casa.capacityEn}</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/en/contact"
              className="px-6 py-2.5 border border-brand-ink text-brand-ink rounded-md hover:bg-brand-ink hover:text-white transition-colors text-sm font-medium uppercase tracking-wider"
            >
              Check availability
            </Link>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-brand-accent text-white rounded-md hover:bg-brand-accent/90 transition-colors text-sm font-medium uppercase tracking-wider"
            >
              Book now
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
                  alt={`${casa.nameEn} - image ${idx + 1}`}
                  className="w-full h-auto block"
                  loading={idx < 2 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* RIGHT - Sticky info sidebar */}
          <aside className="lg:sticky lg:top-44 lg:self-start space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-light mb-4">Description</h2>
              {casa.descriptionEn.map((p, i) => (
                <p key={i} className="text-brand-muted leading-relaxed mb-4">
                  {p}
                </p>
              ))}
            </div>

            <div className="border-t border-brand-line pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-muted mb-4">
                Specifications
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between border-b border-brand-line/50 pb-2">
                  <span className="text-brand-muted">Bedrooms</span>
                  <span className="text-brand-ink font-medium">{casa.bedsEn}</span>
                </li>
                <li className="flex justify-between border-b border-brand-line/50 pb-2">
                  <span className="text-brand-muted">Bathrooms</span>
                  <span className="text-brand-ink font-medium">{casa.baths}</span>
                </li>
                <li className="flex justify-between border-b border-brand-line/50 pb-2">
                  <span className="text-brand-muted">Capacity</span>
                  <span className="text-brand-ink font-medium">{casa.capacityEn}</span>
                </li>
                <li className="flex justify-between pb-2">
                  <span className="text-brand-muted">Surface</span>
                  <span className="text-brand-ink font-medium text-right text-xs">{casa.surface}</span>
                </li>
              </ul>
            </div>

            <div className="border-t border-brand-line pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-muted mb-4">
                Everything you need, without worrying about anything
              </h3>
              <ul className="space-y-3">
                {COMMON.amenitiesEn.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-ink">
                    <span className="text-brand-accent flex-shrink-0 mt-0.5">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-brand-line pt-6">
              <h3 className="text-xs uppercase tracking-widest text-brand-muted mb-4">
                House rules
              </h3>
              <ul className="space-y-2 text-sm text-brand-muted">
                {COMMON.rulesEn.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-brand-line pt-6 space-y-3">
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi, I'm interested in the ${casa.nameEn}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
              >
                💬 WhatsApp
              </a>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center w-full px-6 py-3 bg-brand-accent text-white rounded-md hover:bg-brand-accent/90 transition-colors font-medium"
              >
                Book now
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* OTHER HOUSES */}
      <section className="bg-brand-soft py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <h2 className="font-serif text-3xl font-light mb-8">Discover our other typologies</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listCasas()
              .filter((c) => c.slug !== casa.slug)
              .map((other) => (
                <Link key={other.slug} href={`/en/houses/${other.slug}`} className="group">
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={other.hero}
                      alt={other.nameEn}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif text-xl font-light text-brand-ink mb-1">
                    {other.nameEn}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-brand-muted">{other.taglineEn}</p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </article>
  );
}
