import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | Pueblo La Dehesa",
  description: "Contáctanos por WhatsApp o envíanos un mensaje. Santa Blanca 550, Lo Barnechea, Santiago. Estamos aquí para responder tus preguntas.",
  keywords: "contacto Pueblo La Dehesa, WhatsApp, consultas propiedades, reservas",
  alternates: { canonical: "/contacto" },
  openGraph: {
    title: "Contacto | Pueblo La Dehesa",
    description: "Ponte en contacto con nosotros para más información sobre nuestras propiedades.",
    type: "website",
    locale: "es_CL",
    url: "/contacto",
  },
};

export default async function Contacto({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56984046200";

  return (
    <>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden -mt-20 lg:-mt-24 bg-brand-ink">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-ink via-brand-accent/30 to-brand-ink" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-6 pt-20">
          <p className="text-sm uppercase tracking-[0.3em] mb-4 opacity-90">Contacto</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight">
            Estamos aquí para ayudarte
          </h1>
          <p className="mt-4 text-lg max-w-2xl opacity-95 font-light">
            Si quieres conocer más detalles o coordinar una visita, escríbenos
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Form column - 2/3 */}
          <div className="md:col-span-2">
            <h2 className="font-serif text-3xl md:text-4xl font-light mb-8">
              Envíanos un mensaje
            </h2>

            {sp.ok && (
              <div role="status" className="mb-6 p-4 bg-green-50 text-green-800 border border-green-200 rounded-lg">
                ✓ Gracias, hemos recibido tu mensaje. Te contactaremos pronto.
              </div>
            )}
            {sp.error && (
              <div role="alert" className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg">
                ⚠ Revisa los campos: {decodeURIComponent(sp.error)}
              </div>
            )}

            <form className="space-y-5" action="/api/contact" method="post" noValidate>
              {/* Honeypot */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-brand-ink mb-2">
                    Nombre <span className="text-brand-accent">*</span>
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Tu nombre"
                    className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-ink mb-2">
                    Email <span className="text-brand-accent">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-brand-ink mb-2">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition"
                />
              </div>

              <div>
                <label htmlFor="motivo" className="block text-sm font-medium text-brand-ink mb-2">
                  Motivo de contacto
                </label>
                <select
                  id="motivo"
                  name="motivo"
                  defaultValue="reserva"
                  className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition"
                >
                  <option value="reserva">Reserva / disponibilidad</option>
                  <option value="temporada">Arriendo por temporada</option>
                  <option value="mensual">Arriendo mensual</option>
                  <option value="largo">Arriendo largo plazo</option>
                  <option value="evento">Evento privado / La Casita</option>
                  <option value="otro">Otra consulta</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-brand-ink mb-2">
                  Mensaje <span className="text-brand-accent">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={6}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="w-full border border-brand-line px-4 py-3 bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-10 py-4 bg-brand-accent text-white rounded-lg font-semibold hover:bg-brand-accent/90 transition-colors"
              >
                Enviar mensaje
              </button>

              <p className="text-xs text-brand-muted">
                Al enviar este formulario aceptas nuestras{" "}
                <a href="/politicas-de-privacidad" className="underline hover:text-brand-accent">
                  políticas de privacidad
                </a>
                .
              </p>
            </form>
          </div>

          {/* Info column - 1/3 */}
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-2xl font-light mb-6">
                Información de contacto
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Dirección</p>
                  <p className="text-brand-ink">
                    Santa Blanca 550<br />
                    Lo Barnechea, Santiago<br />
                    Región Metropolitana, Chile
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Email</p>
                  <a
                    href="mailto:contacto@puebloladehesa.com"
                    className="text-brand-ink hover:text-brand-accent transition"
                  >
                    contacto@puebloladehesa.com
                  </a>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">WhatsApp</p>
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    💬 +56 9 8404 6200
                  </a>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-muted mb-1">Reservas</p>
                  <a
                    href={process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-ink hover:text-brand-accent transition underline"
                  >
                    Cotizar online →
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-line">
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-3">Horario de atención</p>
              <p className="text-sm text-brand-muted">Lunes a Viernes</p>
              <p className="text-brand-ink">9:00 - 19:00 hrs</p>
              <p className="text-sm text-brand-muted mt-3">Sábados</p>
              <p className="text-brand-ink">10:00 - 14:00 hrs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-brand-soft py-16">
        <div className="max-w-5xl mx-auto px-6">
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Reserva</p>
              <p className="font-serif text-base text-brand-ink">Por semanas o meses</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Entorno</p>
              <p className="font-serif text-base text-brand-ink">Barrio seguro</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Vista</p>
              <p className="font-serif text-base text-brand-ink">Cordillera</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-widest text-brand-muted mb-2">Calidad</p>
              <p className="font-serif text-base text-brand-ink">Aire limpio</p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
