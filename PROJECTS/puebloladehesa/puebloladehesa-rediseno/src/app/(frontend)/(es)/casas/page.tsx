import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listHouses, imageForPage } from "@/lib/content";
import FAQ from "@/components/FAQ";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Nuestras Casas | Pueblo La Dehesa",
  description: "Explora nuestras casas amobladas en La Dehesa. Estadías flexibles en propiedades de distintos formatos con diseño y comodidad.",
  keywords: "casas amobladas La Dehesa, arrendamiento corto plazo, propiedades disponibles",
  alternates: { canonical: "/casas" },
  openGraph: {
    title: "Nuestras Casas | Pueblo La Dehesa",
    description: "Explora casas amobladas en La Dehesa con estadías flexibles.",
    type: "website",
    locale: "es_CL",
    url: "/casas",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Pueblo La Dehesa — Nuestras Casas" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] }
};

export default function CasasPage() {
  const houses = listHouses("es");
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-16">
          <h1 className="font-serif text-6xl md:text-7xl mb-6 font-light">Nuestras Casas</h1>
          <p className="text-brand-muted text-lg max-w-xl leading-relaxed">
            Estadías flexibles en casas amobladas de distintos formatos, cada una diseñada para ofrecer máxima comodidad y privacidad en La Dehesa.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const img = imageForPage(key);
            const slug = h.path.split("/").pop();
            return (
              <Link key={h.path} href={`/casas/${slug}`} className="group block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                  <Image src={img} alt={h.meta.title || "Casa"} fill sizes="(max-width:768px)100vw,50vw" className="object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6 bg-white">
                  <h2 className="font-serif text-2xl font-light">{h.meta.title?.split("|")[0].trim()}</h2>
                  <p className="text-sm text-brand-muted mt-2 line-clamp-2">{h.meta.description}</p>
                  <div className="mt-4 inline-flex text-xs font-semibold text-brand-accent uppercase tracking-wider">Ver más →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <FAQ locale="es" />
    </>
  );
}
