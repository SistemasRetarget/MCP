import Image from "next/image";
import { notFound } from "next/navigation";
import { listHouses, imageForPage, extractParagraphs, loadImages, pageKey } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import { accommodationSchema, breadcrumbSchema } from "@/lib/schema";

export const revalidate = 3600;

export async function generateStaticParams() {
  return listHouses("es").map((h) => ({ slug: h.path.split("/").pop()! }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = listHouses("es").find((x) => x.path.endsWith(slug));
  return { title: h?.meta.title?.split("|")[0].trim() || "Casa", description: h?.meta.description };
}

export default async function CasaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const house = listHouses("es").find((h) => h.path.endsWith(slug));
  if (!house) notFound();
  const key = pageKey(house.lang, house.path);
  const hero = imageForPage(key);
  const paragraphs = extractParagraphs(house, 4);
  const gallery = loadImages()
    .filter((i) => i.pages.includes(key) && /\.(jpg|jpeg|webp)$/i.test(i.file) && !/logo|icon|sprite/i.test(i.file))
    .slice(0, 6);
  const title = house.meta.title?.split("|")[0].trim() || "Casa";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <article>
      <JsonLd data={accommodationSchema({ name: title, description: house.meta.description || "", slug: slug, image: hero })} />
      <JsonLd data={breadcrumbSchema([
        { name: "Inicio", url: "/" },
        { name: "Casas", url: "/casas" },
        { name: title, url: `/casas/${slug}` }
      ])} />
      <section className="relative aspect-[16/9] max-h-[70vh]">
        <Image src={hero} alt={title} fill priority sizes="100vw" className="object-cover" />
      </section>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-5xl mb-6">{title}</h1>
        <div className="prose prose-lg max-w-none space-y-5 text-brand-muted leading-relaxed">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>{house.meta.description}</p>
          )}
        </div>
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola, me interesa la ${title}`)}`}
            target="_blank"
            rel="noopener"
            className="mt-10 inline-block px-8 py-3 bg-brand-ink text-white hover:bg-brand-accent transition"
          >
            Consultar disponibilidad
          </a>
        )}
      </div>
      {gallery.length > 1 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="font-serif text-3xl mb-8">Galería</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((g) => (
              <div key={g.file} className="relative aspect-square overflow-hidden bg-brand-soft">
                <Image src={`/media/${g.file}`} alt={g.alt || title} fill sizes="(max-width:768px)50vw,33vw" className="object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
