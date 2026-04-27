import Image from "next/image";
import { listHouses, imageForPage } from "@/lib/content";

export const revalidate = 3600;
export const metadata = { title: "Houses" };

export default function Houses() {
  const houses = listHouses("en");
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl mb-4">Houses</h1>
      <p className="text-brand-muted mb-12 max-w-xl">Flexible stays in furnished houses of different formats.</p>
      <div className="grid md:grid-cols-2 gap-8">
        {houses.map((h) => {
          const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
          const slug = h.path.split("/").pop();
          return (
            <a key={h.path} href={`/en/houses/${slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                <Image src={imageForPage(key)} alt={h.meta.title || "House"} fill sizes="(max-width:768px)100vw,50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h2 className="mt-4 font-serif text-2xl">{h.meta.title?.split("|")[0].trim()}</h2>
              <p className="text-sm text-brand-muted mt-1 line-clamp-2">{h.meta.description}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
