export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-brand-soft bg-brand-bg/80 backdrop-blur sticky top-0 z-40">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-serif text-xl tracking-tight">Pueblo La Dehesa</a>
          <ul className="hidden md:flex gap-8 text-sm">
            <li><a href="/casas" className="hover:text-brand-accent">Casas</a></li>
            <li><a href="/experiencias" className="hover:text-brand-accent">Experiencias</a></li>
            <li><a href="/nosotros" className="hover:text-brand-accent">Nosotros</a></li>
            <li><a href="/contacto" className="hover:text-brand-accent">Contacto</a></li>
            <li><a href="/en" className="text-brand-muted hover:text-brand-accent">EN</a></li>
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
            <a href="/contacto" className="hover:text-brand-accent">Contacto</a>
            <a href="/privacidad" className="hover:text-brand-accent">Privacidad</a>
          </div>
          <p>© {new Date().getFullYear()} Pueblo La Dehesa</p>
        </div>
      </footer>
    </>
  );
}
