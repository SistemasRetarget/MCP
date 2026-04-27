import Image from "next/image";

type Props = {
  title: string;
  description: string;
  images: { src: string; alt: string }[];
  kicker?: string;
};

export default function ExperienciasGrid({ title, description, images, kicker }: Props) {
  return (
    <section className="py-section px-6">
      <div className="max-w-container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-serif text-display-md mb-6">{title}</h2>
          <p className="text-base md:text-lg text-brand-ink/80 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden bg-brand-soft group ${
                i % 7 === 0 ? "aspect-[3/4]" : i % 5 === 0 ? "aspect-square" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-[1.2s] ease-out-expo"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {kicker && (
          <p className="text-center mt-16 font-serif text-display-sm max-w-2xl mx-auto text-brand-ink/90 leading-snug">
            {kicker}
          </p>
        )}
      </div>
    </section>
  );
}
