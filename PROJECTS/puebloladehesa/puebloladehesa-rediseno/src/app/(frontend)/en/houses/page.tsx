import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listHouses, imageForPage } from "@/lib/content";
import FAQ from "@/components/FAQ";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Our Houses | Pueblo La Dehesa",
  description: "Explore our furnished houses in La Dehesa. Flexible stays in properties of different formats with design and comfort.",
  keywords: "furnished houses La Dehesa, short-term rental, available properties",
  openGraph: {
    title: "Our Houses | Pueblo La Dehesa",
    description: "Explore furnished houses in La Dehesa with flexible stays.",
    type: "website",
    locale: "en_US",
    url: "https://puebloladehesa.cl/en/houses"
  }
};

export default function Houses() {
  const houses = listHouses("en");
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-16">
          <h1 className="font-serif text-6xl md:text-7xl mb-6 font-light">Our Houses</h1>
          <p className="text-brand-muted text-lg max-w-xl leading-relaxed">
            Flexible stays in furnished houses of different formats, each designed for maximum comfort and privacy in La Dehesa.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const slug = h.path.split("/").pop();
            return (
              <Link key={h.path} href={`/en/houses/${slug}`} className="group block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                  <Image src={imageForPage(key)} alt={h.meta.title || "House"} fill sizes="(max-width:768px)100vw,50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6 bg-white">
                  <h2 className="font-serif text-2xl font-light">{h.meta.title?.split("|")[0].trim()}</h2>
                  <p className="text-sm text-brand-muted mt-2 line-clamp-2">{h.meta.description}</p>
                  <div className="mt-4 inline-flex text-xs font-semibold text-brand-accent uppercase tracking-wider">Learn more →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <FAQ locale="en" />
    </>
  );
}
