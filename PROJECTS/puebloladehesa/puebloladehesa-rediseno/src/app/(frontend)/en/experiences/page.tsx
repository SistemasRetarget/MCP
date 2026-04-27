import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { shopifyImages } from "@/lib/shopify-images";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Experiences | Pueblo La Dehesa",
  description: "Nature, pause and community. Daily and curated experiences at Pueblo La Dehesa: hikes, yoga, helicopter rides and more.",
  alternates: { canonical: "/en/experiences" },
  openGraph: {
    title: "Experiences | Pueblo La Dehesa",
    description: "Three worlds to live Pueblo: Nature, Pause and Community",
    type: "website",
    locale: "en_US",
    url: "/en/experiences",
  },
};

const NATURE = [
  { name: "Guided hikes", icon: "🥾" },
  { name: "Trekking", icon: "🏔️" },
  { name: "Helicopter rides", icon: "🚁" },
  { name: "Horseback riding", icon: "🐎" },
  { name: "Valley outings", icon: "🌄" },
];
const PAUSE = [
  { name: "Yoga classes", icon: "🧘" },
  { name: "Meditation", icon: "🙏" },
  { name: "Relaxation workshops", icon: "✨" },
  { name: "Reading at the park", icon: "📖" },
  { name: "Contemplation", icon: "🌿" },
];
const COMMUNITY = [
  { name: "Coffee at La Casita", icon: "☕" },
  { name: "Cultural activations", icon: "🎨" },
  { name: "Exhibitions", icon: "🖼️" },
  { name: "Brand collaborations", icon: "🤝" },
  { name: "Private events", icon: "🥂" },
];

export default function Experiences() {
  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src={shopifyImages.experiencias.cabalgata} alt="Experiences at Pueblo La Dehesa" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Experiences at Pueblo La Dehesa</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight max-w-4xl">More than a place</h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">A way to live experiences every day</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">At Pueblo, we believe a place's life doesn't just happen on its own</h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          That's why, in addition to what arises naturally from the surroundings, we organize and activate experiences that connect with nature, wellness and community life.
        </p>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg order-2 md:order-1">
              <Image src={shopifyImages.experiencias.trekking} alt="Nature" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm uppercase tracking-widest text-brand-accent mb-4">World 1</p>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Nature: Explore your surroundings</h2>
              <p className="text-lg text-brand-muted leading-relaxed mb-4">
                Walking through the park, exploring the trails or stepping out to clear your mind is part of daily life at Pueblo.
              </p>
              <p className="text-lg text-brand-muted leading-relaxed mb-6">
                On top of that, we organize outdoor experiences to go further: guided hikes, trekking, helicopter rides and outings that connect the Andes, the ski centers and the valley.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {NATURE.map((a) => (<li key={a.name} className="flex items-center gap-2 text-sm text-brand-muted"><span>{a.icon}</span> {a.name}</li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-brand-accent mb-4">World 2</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Pause: Connect with yourself</h2>
            <p className="text-lg text-brand-muted leading-relaxed mb-4">
              At Pueblo, slowing down is also part of the experience. Reading, contemplating the landscape or simply being happens naturally.
            </p>
            <p className="text-lg text-brand-muted leading-relaxed mb-6">
              We complement that pause with wellness activities we activate from Pueblo: yoga classes, meditation, relaxation and workshops that help reconnect.
            </p>
            <ul className="grid grid-cols-2 gap-3">
              {PAUSE.map((a) => (<li key={a.name} className="flex items-center gap-2 text-sm text-brand-muted"><span>{a.icon}</span> {a.name}</li>))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image src={shopifyImages.experiencias.jardin} alt="Pause" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg order-2 md:order-1">
              <Image src={shopifyImages.vidaComunidad} alt="Community" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm uppercase tracking-widest text-brand-accent mb-4">World 3</p>
              <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Community: Share with others</h2>
              <p className="text-lg text-brand-muted leading-relaxed mb-4">
                Pueblo's life is built in everyday encounters: morning coffee, something good to eat, conversations in the park, moments that happen without an agenda.
              </p>
              <p className="text-lg text-brand-muted leading-relaxed mb-6">
                From La Casita, we drive experiences and gatherings that strengthen community: cultural activations, exhibitions and brand collaborations.
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {COMMUNITY.map((a) => (<li key={a.name} className="flex items-center gap-2 text-sm text-brand-muted"><span>{a.icon}</span> {a.name}</li>))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">The experiences that bring Pueblo to life</h3>
          <p className="text-lg opacity-90 mb-8">Book your stay and join our calendar of activities</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">Book Now</a>
            <Link href="/en/contact" className="inline-block border border-white text-white px-10 py-4 rounded-lg font-semibold hover:bg-white hover:text-brand-ink transition-colors">Contact</Link>
          </div>
        </div>
      </section>
    </>
  );
}
