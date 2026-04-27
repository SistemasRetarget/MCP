import Image from "next/image";

type Props = {
  title: string;
  subtitle?: string;
  image: string;
  imageAlt?: string;
};

export default function Hero({ title, subtitle, image, imageAlt = "" }: Props) {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden -mt-20 lg:-mt-24">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
      <div className="relative h-full flex flex-col items-center justify-end text-white text-center px-6 pb-24 lg:pb-32">
        <h1 className="font-serif text-display-lg font-light max-w-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-base md:text-lg max-w-xl opacity-95 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
