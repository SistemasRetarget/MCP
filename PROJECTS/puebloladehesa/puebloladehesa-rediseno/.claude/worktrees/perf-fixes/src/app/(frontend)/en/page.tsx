import Image from "next/image";
import { listHouses, imageForPage, extractParagraphs, getPage } from "@/lib/content";
import { t } from "@/lib/i18n";

export const revalidate = 3600;

export default function HomeEn() {
  const home = getPage("en", "home");
  const houses = listHouses("en");
  const hero = home ? imageForPage("en__en") : "/media/placeholder.svg";
  const intro = home ? extractParagraphs(home, 2)[0] : "";
  const L = t.en;

  return (
    <>
      <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
        <Image src={hero} alt="Pueblo La Dehesa" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">{L.hero_title}</h1>
          <p className="mt-4 text-lg md:text-xl max-w-xl opacity-90">{L.hero_sub}</p>
          <a href="/en/houses" className="mt-8 inline-block px-8 py-3 bg-white text-brand-ink hover:bg-brand-soft transition">{L.cta_houses}</a>
        </div>
      </section>
      {intro && <section className="max-w-3xl mx-auto px-6 py-20 text-center"><p className="text-xl leading-relaxed text-brand-muted">{intro}</p></section>}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl mb-12 text-center">{L.our_houses}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const img = imageForPage(key);
            const slug = h.path.split("/").pop();
            return (
              <a key={h.path} href={`/en/houses/${slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                  <Image src={img} alt={h.meta.title || "House"} fill sizes="(max-width:768px)100vw,50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="mt-4 font-serif text-2xl">{h.meta.title?.split("|")[0].trim()}</h3>
                <p className="mt-1 text-sm text-brand-muted line-clamp-2">{h.meta.description}</p>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
