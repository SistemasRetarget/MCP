import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About | Pueblo La Dehesa",
  description: "The story behind Pueblo La Dehesa: inspired by village life, nature and calm. A place where life feels calm and purposeful.",
  alternates: { canonical: "/en/about" },
  openGraph: {
    title: "About | Pueblo La Dehesa",
    description: "The story behind Pueblo: nature, design and community.",
    type: "website",
    locale: "en_US",
    url: "/en/about",
  },
};

const TESTIMONIALS = [
  { quote: "We proposed an elevated architecture... so that the place, the light and the Andes could converse.", author: "Architecture Team", role: "Design" },
  { quote: "We chose native species and flowers, designing a green that is walked, lived and cared for, accompanied by the Andes.", author: "Landscape Team", role: "Landscape" },
  { quote: "We thought of warm, noble and simple interiors. Spaces that feel good and make you want to inhabit them.", author: "Juan Ignacio Court", role: "Interior Design" },
  { quote: "We accompany every stay with attention and care, so that from day one our guests feel at home.", author: "Maureen Morrison", role: "Pueblo Experience" },
];

const INSPIRATION = [
  { icon: "🏘️", title: "Village life", text: "Spontaneous encounters, daily gestures, the center that brings people together." },
  { icon: "🌳", title: "Nature as the stage", text: "Parks of native trees, walkways and the Andes always present." },
  { icon: "🚶", title: "A more peaceful pace", text: "Days designed for walking, meeting, and living without rush." },
  { icon: "🪵", title: "Thoughtful design", text: "Simple, honest and well-cared for spaces that integrate with the surroundings." },
];

export default function About() {
  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src={shopifyImages.masterplan} alt="Pueblo La Dehesa - About" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">About</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            The story behind Pueblo
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light italic">
            Inspired by village life, nature and calm.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">
          What if slowing down didn't mean leaving the city?
        </h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          Today we live surrounded by noise, traffic and rush. But we all seek, consciously
          or unconsciously, a place where that pace can change. That's where Pueblo begins.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-tight italic">
            "We proposed an elevated architecture... so that the place, the light and the Andes could converse"
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
            <Image src={shopifyImages.ampliosHorizontes} alt="Back to the essential" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">Back to the essential</h2>
            <p className="text-lg text-brand-muted leading-relaxed mb-4">
              Pueblo is born from a simple and powerful idea: to create a place where life feels calm and purposeful.
            </p>
            <p className="text-lg text-brand-muted leading-relaxed mb-2">
              We imagined a simpler way of living, inspired by village life.
            </p>
            <ul className="mt-6 space-y-2 text-brand-muted">
              <li className="flex items-start gap-3"><span className="text-brand-accent">•</span> Walking without rush</li>
              <li className="flex items-start gap-3"><span className="text-brand-accent">•</span> Looking at and feeling the Andes</li>
              <li className="flex items-start gap-3"><span className="text-brand-accent">•</span> Letting the surroundings accompany us</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-tight italic">
            "We chose native species and flowers, designing a green that is walked, lived and cared for, accompanied by the Andes"
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">Our inspiration</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {INSPIRATION.map((p) => (
            <div key={p.title} className="text-center">
              <div className="text-5xl mb-6">{p.icon}</div>
              <h3 className="font-serif text-xl font-light mb-3">{p.title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif text-2xl md:text-3xl lg:text-4xl font-light leading-tight italic">
            "We thought of warm, noble and simple interiors. Spaces that feel good and make you want to inhabit them"
          </p>
          <p className="mt-6 text-sm uppercase tracking-widest text-brand-muted">— Juan Ignacio Court</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">The voices behind Pueblo</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-brand-line rounded-lg p-8">
              <p className="font-serif text-lg font-light italic leading-relaxed mb-6">"{t.quote}"</p>
              <p className="text-sm font-semibold text-brand-ink">{t.author}</p>
              <p className="text-xs uppercase tracking-widest text-brand-muted mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">Live the Pueblo experience</h3>
          <p className="text-lg opacity-90 mb-8">Book your stay and discover why this place is unique</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
              Book Now
            </a>
            <Link href="/en/contact" className="inline-block border border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-ink transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
