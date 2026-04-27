import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "La Dehesa Village · Your refuge in the city", template: "%s · La Dehesa Village" },
  description: "Furnished houses for flexible stays in La Dehesa, surrounded by nature, design and calm.",
  alternates: { languages: { es: "/", en: "/en" } },
  openGraph: { type: "website", locale: "en_US", siteName: "Pueblo La Dehesa" }
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-brand-soft bg-brand-bg/80 backdrop-blur sticky top-0 z-40">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/en" className="font-serif text-xl tracking-tight">Pueblo La Dehesa</a>
          <ul className="hidden md:flex gap-8 text-sm">
            <li><a href="/en/houses" className="hover:text-brand-accent">Houses</a></li>
            <li><a href="/en/experiences" className="hover:text-brand-accent">Experiences</a></li>
            <li><a href="/en/about" className="hover:text-brand-accent">About</a></li>
            <li><a href="/en/contact" className="hover:text-brand-accent">Contact</a></li>
            <li><a href="/" className="text-brand-muted hover:text-brand-accent">ES</a></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="mt-24 border-t border-brand-soft">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-6 text-sm text-brand-muted">
          <div>
            <p className="font-serif text-base text-brand-ink">Pueblo La Dehesa</p>
            <p className="mt-1">La Dehesa, Santiago · Chile</p>
          </div>
          <div className="flex gap-6">
            <a href="/en/contact" className="hover:text-brand-accent">Contact</a>
            <a href="/en/privacy" className="hover:text-brand-accent">Privacy</a>
          </div>
          <p>© {new Date().getFullYear()} Pueblo La Dehesa</p>
        </div>
      </footer>
    </>
  );
}
