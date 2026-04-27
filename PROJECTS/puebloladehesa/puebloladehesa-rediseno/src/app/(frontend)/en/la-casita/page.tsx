import type { Metadata } from "next";
import Image from "next/image";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "La Casita Gourmet Hall | Pueblo La Dehesa",
  description: "La Casita: the heart of Pueblo La Dehesa. An exclusive space for our guests where coffee, food and daily encounters complete the Pueblo experience.",
  openGraph: {
    title: "La Casita | Pueblo La Dehesa",
    description: "Gourmet Hall and exclusive gathering point for guests",
    type: "website",
    locale: "en_US"
  }
};

export default function LaCasita() {
  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image
          src="https://puebloladehesa.cl/cdn/shop/files/07A9898.jpg"
          alt="La Casita Gourmet Hall"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Gourmet Hall</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            La Casita
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">
            Your refuge at Pueblo
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          Like every village, there is a place to gather.
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          At Pueblo, that place is <em>La Casita</em>. An exclusive space for our guests,
          where coffee, delicious food and daily encounters give life to the day-to-day
          and complete the Pueblo experience.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10">
                <span className="text-3xl">☕</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-4">A meeting place</h3>
              <p className="text-brand-muted">
                Small moments that turn the everyday into something special.
                A warm cup, a conversation, a welcoming place.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10">
                <span className="text-3xl">💻</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-4">Workspaces</h3>
              <p className="text-brand-muted">
                Connection, calm and an inspiring environment to work
                surrounded by nature, away from the city noise.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/10">
                <span className="text-3xl">🌿</span>
              </div>
              <h3 className="font-serif text-2xl font-light mb-4">Exclusive for guests</h3>
              <p className="text-brand-muted">
                An intimate space reserved for those staying
                at Pueblo La Dehesa. Your second home.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Moments at La Casita
          </h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Discover its corners, flavors and the warmth that make it unique.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-soft">
            <Image src="https://puebloladehesa.cl/cdn/shop/files/pexels-kai-2055476840-29215602.jpg" alt="Gathering" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-soft">
            <Image src="https://puebloladehesa.cl/cdn/shop/files/pexels-nicola-barts-7936960.jpg" alt="Flavors" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
        <p className="text-center text-xs text-brand-muted mt-6 italic">*Reference images</p>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl font-light italic leading-relaxed">
            "Small moments that turn the everyday into something special..."
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">
          Want to experience Pueblo?
        </h3>
        <p className="text-lg text-brand-muted mb-8">
          Book your stay and enjoy La Casita as part of your experience
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
            Book Now
          </a>
          <a href="/en/contact" className="inline-block border border-brand-ink text-brand-ink px-8 py-3 rounded-lg font-semibold hover:bg-brand-ink hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </section>
    </>
  );
}
