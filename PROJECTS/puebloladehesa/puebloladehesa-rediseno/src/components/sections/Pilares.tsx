import Image from "next/image";

type Pilar = {
  image: string;
  kicker: string;
  title: string;
};

type Props = {
  items: Pilar[];
};

export default function Pilares({ items }: Props) {
  return (
    <section className="py-section-sm px-6 bg-brand-cream">
      <div className="max-w-container mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {items.map((pilar, i) => (
            <article key={i} className="text-center group">
              <div className="relative aspect-square overflow-hidden mb-5">
                <Image
                  src={pilar.image}
                  alt={pilar.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out-expo"
                  loading="lazy"
                />
              </div>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">
                {pilar.kicker}
              </p>
              <h3 className="font-serif text-xl leading-snug px-2">
                {pilar.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
