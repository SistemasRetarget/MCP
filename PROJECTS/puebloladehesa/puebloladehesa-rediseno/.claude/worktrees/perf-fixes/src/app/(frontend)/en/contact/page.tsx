import { t } from "@/lib/i18n";

export const metadata = { title: "Contact" };

export default function Contact() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const L = t.en;
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-serif text-5xl mb-6">{L.contact_title}</h1>
      <p className="text-brand-muted mb-10">{L.contact_desc}</p>
      {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="inline-block px-8 py-3 bg-green-500 text-white hover:bg-green-600 transition mb-8">Write on WhatsApp</a>}
      <form className="space-y-4" action="/api/contact" method="post">
        <input type="hidden" name="lang" value="en" />
        <input name="nombre" required placeholder={L.name} className="w-full border border-brand-soft px-4 py-3 bg-white" />
        <input name="email" type="email" required placeholder={L.email} className="w-full border border-brand-soft px-4 py-3 bg-white" />
        <textarea name="mensaje" required rows={5} placeholder={L.message} className="w-full border border-brand-soft px-4 py-3 bg-white" />
        <button type="submit" className="px-8 py-3 bg-brand-ink text-white hover:bg-brand-accent transition">{L.send}</button>
      </form>
    </div>
  );
}
