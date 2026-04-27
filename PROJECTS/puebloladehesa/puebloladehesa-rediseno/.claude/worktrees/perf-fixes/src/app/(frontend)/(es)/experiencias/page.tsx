import { getPage, extractParagraphs, imageForPage } from "@/lib/content";
import Image from "next/image";

export const metadata = { title: "Experiencias" };

export default function Experiencias() {
  const p = getPage("es", "/pages/experiencias");
  const paras = p ? extractParagraphs(p, 6) : [];
  const img = p ? imageForPage(`es__pages_experiencias`) : "/media/placeholder.svg";
  return (
    <div>
      <section className="relative h-[50vh] min-h-[320px]">
        <Image src={img} alt="Experiencias" fill priority sizes="100vw" className="object-cover" />
      </section>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-5 text-brand-muted leading-relaxed">
        <h1 className="font-serif text-5xl text-brand-ink mb-8">Experiencias</h1>
        {paras.length > 0 ? paras.map((t, i) => <p key={i}>{t}</p>) : <p>Bienestar, outdoor y comunidad en un entorno único.</p>}
      </div>
    </div>
  );
}
