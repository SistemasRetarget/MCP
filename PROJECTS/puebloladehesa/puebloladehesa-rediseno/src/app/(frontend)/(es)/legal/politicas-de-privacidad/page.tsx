import type { Metadata } from "next";
import { loadLegal } from "@/lib/legal";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Políticas de Privacidad | Pueblo La Dehesa",
  description:
    "Política de privacidad de www.puebloladehesa.cl. Cómo OPERADORA PUEBLO SpA recolecta, trata y protege tus datos personales según la legislación chilena vigente.",
  alternates: { canonical: "/legal/politicas-de-privacidad" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Políticas de Privacidad | Pueblo La Dehesa",
    description:
      "Cómo tratamos y protegemos los datos personales en puebloladehesa.cl.",
    type: "article",
    locale: "es_CL",
    url: "/legal/politicas-de-privacidad",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Pueblo La Dehesa — Políticas de Privacidad" }]
  },
  twitter: { card: "summary_large_image", images: ["/og-image.jpg"] }
};

export default function PrivacidadPage() {
  const blocks = loadLegal("privacidad.txt");
  return (
    <article className="max-w-3xl mx-auto px-6 py-20">
      <header className="mb-12">
        <p className="text-brand-muted text-sm uppercase tracking-wider mb-3">Legal</p>
        <h1 className="font-serif text-5xl md:text-6xl font-light text-brand-ink">
          Políticas de Privacidad
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
