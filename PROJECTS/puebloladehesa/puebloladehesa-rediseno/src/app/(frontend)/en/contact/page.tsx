import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Pueblo La Dehesa",
  description: "Contact us via WhatsApp or send a message. Santa Blanca 550, Lo Barnechea, Santiago. We're here to help.",
  keywords: "contact Pueblo La Dehesa, WhatsApp, bookings",
  alternates: { canonical: "/en/contact" },
  openGraph: {
    title: "Contact | Pueblo La Dehesa",
    description: "Get in touch for more information about our properties.",
    type: "website",
    locale: "en_US",
    url: "/en/contact",
  },
};

export default async function Contact({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56984046200";

  return (
    <>
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden -mt-20 lg:-mt-24 bg-brand-ink">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-ink via-brand-accent/30 to-brand-ink" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6 pt-20">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Contact</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">We're here to help</h1>
          <p className="mt-4 text-lg max-w-2xl opacity-95 font-light">If you'd like to know more details or schedule a visit, write to us</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">Send us a message</h2>

            {sp.ok && (
              <div role="status" className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
                ✓ Thank you, we received your message. We'll get back to you soon.
              </div>
            )}
            {sp.error && (
              <div role="alert" className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
                ⚠ Please review the fields: {decodeURIComponent(sp.error)}
              </div>
            )}

            <form className="space-y-5" action="/api/contact" method="post" noValidate>
              <input type="hidden" name="lang" value="en" />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-brand-ink mb-2">Name <span className="text-brand-accent">*</span></label>
                  <input id="nombre" name="nombre" required minLength={2} maxLength={100} placeholder="Your name" className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-ink mb-2">Email <span className="text-brand-accent">*</span></label>
                  <input id="email" name="email" type="email" required placeholder="you@email.com" className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition" />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-brand-ink mb-2">Phone</label>
                <input id="telefono" name="telefono" type="tel" placeholder="+56 9 1234 5678" className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition" />
              </div>

              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-brand-ink mb-2">Reason for contact</label>
                <select id="motivo" name="motivo" defaultValue="reserva" className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition">
                  <option value="reserva">Booking / availability</option>
                  <option value="temporada">Seasonal rental</option>
                  <option value="mensual">Monthly rental</option>
                  <option value="largo">Long-term rental</option>
                  <option value="evento">Private event / La Casita</option>
                  <option value="otro">Other inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-brand-ink mb-2">Message <span className="text-brand-accent">*</span></label>
                <textarea id="mensaje" name="mensaje" required minLength={10} maxLength={2000} rows={6} placeholder="Tell us how we can help..." className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition resize-none" />
              </div>

              <button type="submit" className="px-10 py-4 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors">
                Send message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-light mb-6">Contact information</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Address</p>
                  <p className="text-brand-ink">Santa Blanca 550<br />Lo Barnechea, Santiago<br />Metropolitan Region, Chile</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Email</p>
                  <a href="mailto:contacto@puebloladehesa.com" className="text-brand-ink hover:text-brand-accent transition">contacto@puebloladehesa.com</a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">WhatsApp</p>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition">💬 +56 9 8404 6200</a>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Bookings</p>
                  <a href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"} target="_blank" rel="noopener noreferrer" className="text-brand-ink hover:text-brand-accent transition underline">Book online →</a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-line">
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">Office hours</p>
              <p className="text-sm text-brand-muted">Monday to Friday</p>
              <p className="text-brand-ink">9:00 AM - 7:00 PM</p>
              <p className="text-sm text-brand-muted mt-3">Saturday</p>
              <p className="text-brand-ink">10:00 AM - 2:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
