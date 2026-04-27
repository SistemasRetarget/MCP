import Image from "next/image";

type Props = {
  image: string;
  imageAlt?: string;
  title: string;
  paragraphs: string[];
  reverse?: boolean;
};

export default function ImageWithText({ image, imageAlt = "", title, paragraphs, reverse = false }: Props) {
  return (
    <section className="py-section px-6">
      <div className="max-w-container mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className={`relative aspect-[4/3] lg:aspect-square overflow-hidden ${reverse ? "lg:order-2" : ""}`}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
        <div className={reverse ? "lg:order-1" : ""}>
          <h2 className="font-serif text-display-md mb-8 leading-tight">
            {title}
          </h2>
          <div className="space-y-5 text-base leading-relaxed text-brand-ink/80">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
