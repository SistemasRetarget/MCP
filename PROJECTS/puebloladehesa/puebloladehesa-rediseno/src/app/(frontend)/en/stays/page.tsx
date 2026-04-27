import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { listHouses, imageForPage } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Stays | Pueblo La Dehesa",
  description: "Flexible stays in spaces designed to rest and feel at home. Your own space with mountain views, surrounded by gardens and a great park.",
  openGraph: {
    title: "Stays | Pueblo La Dehesa",
    description: "Furnished houses with mountain views. 4 typologies for up to 4 people.",
    type: "website",
    locale: "en_US"
  }
};

const SERVICES = [
  { title: "Daily cleaning", description: "Keep your space pristine throughout your stay", icon: "✨" },
  { title: "24/7 concierge", description: "Personalized attention whenever you need it", icon: "🛎️" },
  { title: "High-speed WiFi", description: "Connectivity to work or enjoy", icon: "📡" },
  { title: "Private parking", description: "Safe space for your vehicle", icon: "🚗" },
  { title: "La Casita access", description: "Exclusive gourmet hall for guests", icon: "☕" },
  { title: "Included experiences", description: "Walks, yoga and park activities", icon: "🌿" }
];

export default function StaysPrincipal() {
  const houses = listHouses("en");

  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image
          src="https://puebloladehesa.cl/cdn/shop/files/07A0142.jpg"
          alt="Stays Pueblo La Dehesa"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Stays</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight max-w-4xl">
            Spaces designed to rest and feel at home
          </h1>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Here, the everyday becomes special</h2>
        <p className="text-lg text-brand-muted leading-relaxed">
          Your own space with mountain views, surrounded by gardens, walkways and a great park.
          A new way to inhabit the essential.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">Explore the different places we have for you</h2>
          <p className="text-lg text-brand-muted max-w-3xl mx-auto">
            We have different typologies of 1 and 2 bedrooms, designed for up to 4 people,
            all fully equipped, with private terraces and clear mountain views.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {houses.map((h) => {
            const key = `${h.lang}_${h.path.replace(/\//g, "_")}`;
            const img = imageForPage(key);
            const slug = h.path.split("/").pop();
            return (
              <Link key={h.path} href={`/en/houses/${slug}`} className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-soft">
                  <Image src={img} alt={h.meta.title || "House"} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6 bg-white">
                  <h3 className="font-serif text-2xl font-light">{h.meta.title?.split("|")[0].trim() || "House"}</h3>
                  <p className="mt-2 text-sm text-brand-muted line-clamp-2">{h.meta.description || ""}</p>
                  <div className="mt-4 inline-flex text-xs font-semibold text-brand-accent uppercase tracking-wider">View more →</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-brand-soft py-24 mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Everything you need... without worrying about anything</h2>
            <p className="text-lg text-brand-muted max-w-3xl mx-auto">
              Staying at Pueblo is more than having a unique space: it's accessing services and experiences
              that connect with the surroundings. From the everyday to walks and tourism experiences,
              everything is designed to live with more calm and make better use of your time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="font-semibold text-brand-ink mb-2">{s.title}</h3>
                <p className="text-sm text-brand-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">Different ways to inhabit the essential</h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Choose between our short-medium or long-term stays in our 4 house typologies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-8 rounded-lg border border-brand-line">
            <h3 className="font-serif text-2xl font-light mb-3">Seasonal</h3>
            <p className="text-sm text-brand-muted mb-6">Few-day stays for vacation or to discover Pueblo</p>
            <span className="inline-block text-xs font-semibold text-brand-accent uppercase tracking-wider">Short-term</span>
          </div>
          <div className="text-center p-8 rounded-lg border-2 border-brand-accent bg-brand-soft">
            <h3 className="font-serif text-2xl font-light mb-3">Monthly</h3>
            <p className="text-sm text-brand-muted mb-6">A new way to inhabit the city, month by month</p>
            <span className="inline-block text-xs font-semibold text-brand-accent uppercase tracking-wider">Medium-term</span>
          </div>
          <div className="text-center p-8 rounded-lg border border-brand-line">
            <h3 className="font-serif text-2xl font-light mb-3">Annual</h3>
            <p className="text-sm text-brand-muted mb-6">Your permanent home at Pueblo La Dehesa</p>
            <span className="inline-block text-xs font-semibold text-brand-accent uppercase tracking-wider">Long-term</span>
          </div>
        </div>
      </section>

      <section className="bg-brand-ink text-white py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">Ready for your stay?</h3>
          <p className="text-lg opacity-90 mb-8">Book your house now and experience Pueblo La Dehesa</p>
          <a href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-accent text-white px-10 py-4 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
            Book Now
          </a>
        </div>
      </section>
    </>
  );
}
