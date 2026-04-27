import Image from "next/image";
import { getPage, listHouses, imageForPage, extractParagraphs } from "@/lib/content";

export const revalidate = 3600;

export default function Home() {
  const home = getPage("es", "home");
  const houses = listHouses("es");
  const heroImg = home ? imageForPage("es__home", "/media/placeholder.svg") : "/media/placeholder.svg";
  const intro = home ? extractParagraphs(home, 2)[0] : "";

  return (
    <>
      <section className="relative h-[85vh] min-h-[500px] overflow-hidden">
        <Image
          src={heroImg}
          alt="Pueblo La Dehesa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight">
            Tu refugio en la ciudad
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-xl opacity-90">
            Casas rodeadas de naturaleza, diseño y calma en La Dehesa.
          </p>
          <a
            href="/casas"
            className="mt-8 inline-block px-8 py-3 bg-white text-brand-ink hover:bg-brand-soft transition"
          >
            Conocer las casas
          </a>
        </div>
      </section>

      {intro && (
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-xl leading-relaxed text-brand-muted">{intro}</p>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-serif text-4xl mb-12 text-center">Nuestras casas</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const img = imageForPage(key);
            const slug = h.path.split("/").pop();
            return (
              <a
                key={h.path}
                href={`/casas/${slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft">
                  <Image
                    src={img}
                    alt={h.meta.title || "Casa"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="mt-4 font-serif text-2xl">{h.meta.title?.split("|")[0].trim() || "Casa"}</h3>
                <p className="mt-1 text-sm text-brand-muted line-clamp-2">
                  {h.meta.description || ""}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 bg-brand-soft/30 rounded-2xl my-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl mb-4">Experiencias</h2>
          <p className="text-brand-muted mb-8">
            Bienestar, naturaleza y comunidad cerca de todo y envuelto en silencio.
          </p>
          <a href="/experiencias" className="underline underline-offset-4 hover:text-brand-accent">
            Ver experiencias →
          </a>
        </div>
      </section>
    </>
  );
}
