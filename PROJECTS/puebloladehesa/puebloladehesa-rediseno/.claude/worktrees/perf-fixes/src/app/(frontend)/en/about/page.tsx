import { getPage, extractParagraphs, imageForPage } from "@/lib/content";
import Image from "next/image";

export const metadata = { title: "About" };

export default function About() {
  const p = getPage("en", "/en/pages/nosotros");
  const paras = p ? extractParagraphs(p, 6) : [];
  const img = imageForPage("en_en_pages_nosotros");
  return (
    <div>
      <section className="relative h-[50vh] min-h-[320px]">
        <Image src={img} alt="About" fill priority sizes="100vw" className="object-cover" />
      </section>
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-5 text-brand-muted leading-relaxed">
        <h1 className="font-serif text-5xl text-brand-ink mb-8">About</h1>
        {paras.length > 0 ? paras.map((t, i) => <p key={i}>{t}</p>) : <p>Pueblo La Dehesa is a boutique hospitality project where nature, design and calm meet.</p>}
      </div>
    </div>
  );
}
