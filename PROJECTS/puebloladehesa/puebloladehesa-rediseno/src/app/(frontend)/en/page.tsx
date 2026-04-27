import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listHouses, imageForPage, extractParagraphs, getPage } from "@/lib/content";
import { t } from "@/lib/i18n";
import Features from "@/components/sections/Features";
// import Testimonials from "@/components/Testimonials";
// import FAQ from "@/components/FAQ";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pueblo La Dehesa | Luxury Homes in La Dehesa, Santiago",
  description: "Discover luxury homes surrounded by nature in La Dehesa. Design, tranquility and refuge in the city. Explore our exclusive properties.",
  keywords: "houses La Dehesa, Santiago properties, luxury homes, house rentals",
  openGraph: {
    title: "Pueblo La Dehesa | Luxury Homes in La Dehesa",
    description: "Homes surrounded by nature, design and tranquility in La Dehesa.",
    type: "website",
    locale: "en_US",
    url: "https://puebloladehesa.cl/en"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pueblo La Dehesa | Luxury Homes in La Dehesa",
    description: "Homes surrounded by nature, design and tranquility in La Dehesa."
  }
};

export default function HomeEn() {
  const home = getPage("en", "home");
  const houses = listHouses("en");
  const hero = home ? imageForPage("en__en") : "/media//media/placeholder.svg";
  const intro = home ? extractParagraphs(home, 2)[0] : "";
  const L = t.en;

  return (
    <>
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <Image src={hero} alt="Pueblo La Dehesa" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        <div className="relative h-full flex flex-col items-center justify-end text-white text-center px-6 pb-24 lg:pb-32">
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">{L.hero_title}</h1>
          <p className="mt-4 text-lg md:text-xl max-w-xl opacity-90">{L.hero_sub}</p>
          <Link href="/en/houses" className="mt-10 inline-block px-8 py-4 btn-primary">{L.cta_houses}</Link>
        </div>
      </section>
      {intro && <section className="max-w-3xl mx-auto px-6 py-20 text-center"><p className="text-xl leading-relaxed text-brand-muted">{intro}</p></section>}

      <Features locale="en" />

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-6 font-light">A place to stay as long as you need</h2>
            <p className="text-brand-muted leading-relaxed text-lg">
              Furnished house rentals integrated into the landscape, with natural light and views of the Andes. Like every town, there's a meeting point: La Casita, a space for a coffee, something delicious to eat, to work calmly or simply to cross paths with others naturally.
            </p>
          </div>
          <div className="relative h-[400px] overflow-hidden rounded-lg bg-gradient-to-br from-brand-soft to-gray-200 hidden md:block">
            <Image
              src="https://puebloladehesa.cl/cdn/shop/files/Locacion_AEREA_1_1_38dd9d39-992c-4897-9b6f-cd9711ae23fb.webp"
              alt="Panoramic view of the La Dehesa valley"
              fill
              className="object-cover opacity-90"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl mb-4 font-light">{L.our_houses}</h2>
          <p className="text-brand-muted text-lg max-w-2xl mx-auto">Each property is a unique refuge surrounded by nature, design and comfort</p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const img = imageForPage(key);
            const slug = h.path.split("/").pop();
            return (
              <Link key={h.path} href={`/en/houses/${slug}`} className="group block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                  <Image src={img} alt={h.meta.title || "House"} fill sizes="(max-width:768px)100vw,50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6 bg-white">
                  <h3 className="font-serif text-2xl font-light">{h.meta.title?.split("|")[0].trim()}</h3>
                  <p className="mt-2 text-sm text-brand-muted line-clamp-2">{h.meta.description}</p>
                  <div className="mt-4 inline-flex text-xs font-semibold text-brand-accent uppercase tracking-wider">Learn more →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Testimonials section hidden - not in production */}
      {/* <Testimonials locale="en" /> */}

      <section className="max-w-6xl mx-auto px-6 py-24 my-20 border-t border-brand-line">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-5xl md:text-6xl mb-6 font-light">Experiences</h2>
          <p className="text-brand-muted text-lg mb-12 leading-relaxed">
            Wellness, nature and community. Discover exclusive activities and services, surrounded by silence and privacy.
          </p>
          <Link
            href="/en/experiences"
            className="inline-flex px-8 py-4 btn-primary"
          >
            Explore experiences
          </Link>
        </div>
      </section>

      {/* FAQ section hidden - not in production */}
      {/* <FAQ locale="en" /> */}
    </>
  );
}
