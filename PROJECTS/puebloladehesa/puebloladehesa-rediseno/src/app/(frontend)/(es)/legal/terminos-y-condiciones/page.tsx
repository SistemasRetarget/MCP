import type { Metadata } from "next";
import { loadLegal } from "@/lib/legal";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Términos y Condiciones | Pueblo La Dehesa",
  description:
    "Términos y condiciones de uso del sitio www.puebloladehesa.cl. Información legal sobre el acceso y uso del sitio operado por OPERADORA PUEBLO SpA.",
  alternates: { canonical: "/legal/terminos-y-condiciones" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Términos y Condiciones | Pueblo La Dehesa",
    description: "Términos y condiciones de uso del sitio puebloladehesa.cl.",
    type: "article",
    locale: "es_CL",
    url: "/legal/terminos-y-condiciones",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Pueblo La Dehesa — Términos y Condiciones" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] }
};

export default function TerminosPage() {
  const blocks = loadLegal("terminos.txt");
  return (
    <article className="max-w-3xl mx-auto px-6 py-20">
      <header className="mb-12">
        <p className="text-brand-muted text-sm uppercase tracking-wider mb-3">Legal</p>
        <h1 className="font-serif text-5xl md:text-6xl font-light text-brand-ink">
          Términos y Condiciones
        </h1>
        <p className="text-brand-muted text-sm mt-4">
          Última actualización: abril de 2026
        </p>
      </header>

      <div className="space-y-6 text-brand-ink/80 leading-relaxed">
        {blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2
              key={i}
              className="font-serif text-2xl text-brand-ink mt-12 mb-4 font-light"
            >
              {b.text}
            </h2>
          ) : (
            <p key={i} className="text-base">
              {b.text}
            </p>
          )
        )}
      </div>
    </article>
  );
}
