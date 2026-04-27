import type { Metadata } from "next";
import Image from "next/image";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Location | Pueblo La Dehesa",
  description: "Pueblo La Dehesa: close to everything, in a quiet environment. Located in a residential area of La Dehesa with excellent connectivity and privileged natural surroundings.",
  openGraph: {
    title: "Location | Pueblo La Dehesa",
    description: "33.367° S, 70.530° W — In the heart of the La Dehesa valley",
    type: "website",
    locale: "en_US"
  }
};

const NEARBY_PLACES = [
  { title: "Costanera Norte access", description: "Quick connectivity to the rest of Santiago", icon: "🛣️", time: "5 min" },
  { title: "Shopping & restaurants", description: "El Golf, Nueva Las Condes", icon: "🛍️", time: "10 min" },
  { title: "Office districts", description: "El Golf, Nueva Las Condes", icon: "🏢", time: "10 min" },
  { title: "Schools", description: "Newland, Santiago College, Nido de Águilas", icon: "🎓", time: "3-10 min" },
  { title: "Parks & Hills", description: "Cerro Manquehue, Manquehuito, El Durazno", icon: "⛰️", time: "5 min" },
  { title: "Plazas & pumptrack", description: "Spaces for sports and recreation", icon: "🌳", time: "5 min" },
  { title: "Ski resorts", description: "Valle Nevado, La Parva, El Colorado", icon: "⛷️", time: "1.5 hrs" },
  { title: "Nearby heliport", description: "Helicopter experiences for our guests", icon: "🚁", time: "4 min" }
];

export default function Location() {
  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden -mt-20 lg:-mt-24">
        <Image src="https://puebloladehesa.cl/cdn/shop/files/07A0063.jpg" alt="Location" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">33.367° S, 70.530° W</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">Location</h1>
          <p className="mt-6 text-lg md:text-xl max-w-2xl opacity-95 font-light">In the heart of the La Dehesa valley</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-serif text-4xl md:text-5xl font-light mb-8">Close to everything, in a quiet environment</h2>
        <p className="text-lg text-brand-muted leading-relaxed mb-6">
          Pueblo La Dehesa is located in a residential area of La Dehesa, with excellent connectivity
          and privileged natural surroundings.
        </p>
        <p className="text-lg text-brand-muted leading-relaxed">
          Its location allows you to be close to the main accesses, services and amenities of the area,
          without giving up the silence, the views and the feeling of living surrounded by nature.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-serif text-3xl font-light mb-6">How to Get There</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-brand-ink mb-2">Address</h4>
                <p className="text-brand-muted">Pueblo La Dehesa, La Dehesa, Santiago, Metropolitan Region, Chile</p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-ink mb-2">Coordinates</h4>
                <p className="text-brand-muted font-mono text-sm">33.367° S, 70.530° W</p>
              </div>
              <div>
                <h4 className="font-semibold text-brand-ink mb-2">From downtown Santiago</h4>
                <p className="text-brand-muted">25-30 minutes by car via Costanera Norte. An oasis of tranquility just minutes from the city.</p>
              </div>
              <div className="pt-6 border-t border-brand-line">
                <a href="https://maps.google.com/?q=Pueblo+La+Dehesa+Santiago" target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-accent text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] rounded-lg overflow-hidden bg-brand-soft">
            <iframe src="https://maps.google.com/maps?q=Santa+Blanca+550+Lo+Barnechea+Santiago&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0" title="Pueblo La Dehesa Map" />
          </div>
        </div>
      </section>

      <section className="bg-brand-soft py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-light mb-4">What You'll Find Nearby</h2>
            <p className="text-lg text-brand-muted max-w-2xl mx-auto">Connectivity, nature and services within reach of your stay</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEARBY_PLACES.map((place) => (
              <div key={place.title} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{place.icon}</div>
                <h3 className="font-semibold text-brand-ink mb-2">{place.title}</h3>
                <p className="text-sm text-brand-muted mb-3">{place.description}</p>
                <p className="text-xs font-semibold text-brand-accent uppercase tracking-wider">{place.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h3 className="font-serif text-3xl md:text-4xl font-light mb-6">Visit us at Pueblo La Dehesa</h3>
        <p className="text-lg text-brand-muted mb-8">Book your stay and discover why this place is unique</p>
        <a href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
          Book Now
        </a>
      </section>
    </>
  );
}
