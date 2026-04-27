"use client";

import Link from "next/link";
import Image from "next/image";
import { track } from "@/lib/tracking";

type Casa = {
  slug: string;
  name: string;
  specs: string;
  description: string;
  image: string;
};

type Props = {
  title: string;
  subtitle?: string;
  items: Casa[];
  locale?: "es" | "en";
};

export default function Casas({ title, subtitle, items, locale = "es" }: Props) {
  const base = locale === "en" ? "/en/houses" : "/casas";

  return (
    <section className="py-section px-6">
      <div className="max-w-container mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-serif text-display-md mb-4">{title}</h2>
          {subtitle && (
            <p className="text-base md:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-12">
          {items.map((casa) => (
            <Link
              key={casa.slug}
              href={`${base}/${casa.slug}`}
              onClick={() => track("view_casa", { slug: casa.slug, source: "home_grid" })}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-soft mb-5">
                <Image
                  src={casa.image}
                  alt={casa.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out-expo"
                  loading="lazy"
                />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl mb-1">{casa.name}</h3>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">
                {casa.specs}
              </p>
              <p className="text-sm leading-relaxed text-brand-ink/80 mb-4 line-clamp-3">
                {casa.description}
              </p>
              <span className="inline-block text-sm link-hover">
                {locale === "en" ? "View more →" : "Ver más →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
