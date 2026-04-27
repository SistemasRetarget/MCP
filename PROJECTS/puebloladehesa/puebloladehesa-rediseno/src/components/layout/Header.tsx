"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type HeaderProps = {
  locale?: "es" | "en";
};

type NavChild = { label: string; href: string; isHeader?: boolean };
type NavItem = { label: string; href: string; children?: NavChild[] };

const NAV_ES: NavItem[] = [
  { label: "Nosotros", href: "/nosotros" },
  {
    label: "Estadías",
    href: "/estadias",
    children: [
      { label: "— Tipologías", href: "/estadias", isHeader: true },
      { label: "Casa Doble Altura", href: "/casas/casa-doble-altura" },
      { label: "Casa Parque", href: "/casas/casa-parque" },
      { label: "Casa Panorámica", href: "/casas/casa-panoramica" },
      { label: "Casa Suite", href: "/casas/casa-suite" },
      { label: "— Modalidades", href: "/estadias", isHeader: true },
      { label: "Arriendo por Temporada", href: "/temporada" },
      { label: "Arriendo Mensual", href: "/mensual" },
      { label: "Departamento Amoblado", href: "/departamento-amoblado" },
      { label: "Pueblito (alt. Hotel)", href: "/pueblito" },
      { label: "Ver todo", href: "/estadias" }
    ]
  },
  { label: "Experiencias", href: "/experiencias" },
  { label: "La Casita Salón Gourmet", href: "/la-casita" },
  { label: "Ubicación", href: "/ubicacion" }
];

const NAV_EN: NavItem[] = [
  { label: "About", href: "/en/about" },
  {
    label: "Stays",
    href: "/en/stays",
    children: [
      { label: "Double Height House", href: "/en/houses/double-height" },
      { label: "Park House", href: "/en/houses/park" },
      { label: "Panoramic House", href: "/en/houses/panoramic" },
      { label: "Suite House", href: "/en/houses/suite" },
      { label: "View all", href: "/en/stays" }
    ]
  },
  { label: "Experiences", href: "/en/experiences" },
  { label: "La Casita Gourmet", href: "/en/la-casita" },
  { label: "Location", href: "/en/location" }
];

export default function Header({ locale = "es" }: HeaderProps) {
  const nav = locale === "en" ? NAV_EN : NAV_ES;
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  const pushEvent = (name: string, params: Record<string, unknown> = {}) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: name, ...params });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-brand-bg border-b border-brand-line text-brand-ink" : "bg-transparent text-white"
      }`}
    >
      {/* Skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-brand-ink focus:text-white focus:px-3 focus:py-1 focus:z-50"
      >
        Ir al contenido
      </a>

      <div className="max-w-container mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-20 lg:h-24 gap-4">
          {/* Desktop nav (left column) */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Navegación principal">
            {nav.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenSubmenu(item.label)}
                onMouseLeave={() => setOpenSubmenu(null)}
              >
                <Link
                  href={item.href}
                  className={`link-hover text-sm tracking-wide py-2 ${scrolled ? "text-brand-ink" : "text-white"}`}
                >
                  {item.label}
                </Link>
                {item.children && openSubmenu === item.label && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="bg-white shadow-lg border border-brand-line min-w-[260px] py-2">
                      {item.children.map((child, idx) => (
                        child.isHeader ? (
                          <div
                            key={`h-${idx}`}
                            className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-muted"
                          >
                            {child.label.replace(/^—\s*/, "")}
                          </div>
                        ) : (
                          <Link
                            key={child.href + idx}
                            href={child.href}
                            className="block px-5 py-2 text-sm text-brand-ink hover:bg-brand-soft transition-colors"
                          >
                            {child.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Logo (center column) */}
          <Link
            href={locale === "en" ? "/en" : "/"}
            aria-label="Pueblo La Dehesa — Inicio"
            className="flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-pueblo.svg"
              alt="Pueblo La Dehesa"
              className="h-12 lg:h-14 w-auto flex-shrink-0 transition-[filter] duration-300"
              style={{ filter: scrolled ? "none" : "brightness(0) invert(1)" }}
            />
          </Link>

          {/* Right side: lang + CTAs + burger */}
          <div className="flex items-center justify-end gap-3 lg:gap-4">
            {/* Language switcher */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                aria-expanded={langOpen}
                aria-haspopup="true"
                className="text-xs uppercase tracking-widest py-2 px-3 hover:text-brand-accent"
              >
                {locale === "en" ? "English" : "Español"}
              </button>
              {langOpen && (
                <div className="absolute top-full right-0 bg-white shadow-lg border border-brand-line min-w-[140px] py-1 z-50">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-brand-ink hover:bg-brand-soft"
                    onClick={() => setLangOpen(false)}
                  >
                    Español
                  </Link>
                  <Link
                    href="/en"
                    className="block px-4 py-2 text-sm text-brand-ink hover:bg-brand-soft"
                    onClick={() => setLangOpen(false)}
                  >
                    English
                  </Link>
                </div>
              )}
            </div>

            {/* Desktop CTAs */}
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener"
              onClick={() => pushEvent("click_reserva", { location: "header" })}
              className="hidden md:inline-flex items-center bg-brand-orange hover:bg-brand-orange-dark text-white text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
            >
              {locale === "en" ? "Book Here" : "Reserva acá"}
            </a>
            <Link
              href={locale === "en" ? "/en/contact" : "/contacto"}
              onClick={() => pushEvent("click_contacto", { location: "header" })}
              className={`hidden lg:inline-flex items-center text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors border ${
                scrolled
                  ? "border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-brand-ink"
              }`}
            >
              {locale === "en" ? "Contact" : "Contáctanos"}
            </Link>

            {/* Burger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2"
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Menú</span>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M3 7h18" strokeLinecap="round" />
                    <path d="M3 12h18" strokeLinecap="round" />
                    <path d="M3 17h18" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-brand-bg z-40 overflow-y-auto">
          <nav className="px-6 py-8 flex flex-col gap-1" aria-label="Navegación móvil">
            {nav.map((item) => (
              <div key={item.label} className="border-b border-brand-line">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-4 font-serif text-2xl"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pb-3 pl-4 flex flex-col gap-1">
                    {item.children.map((child, idx) => (
                      child.isHeader ? (
                        <div key={`mh-${idx}`} className="pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
                          {child.label.replace(/^—\s*/, "")}
                        </div>
                      ) : (
                        <Link
                          key={child.href + idx}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-sm text-brand-muted py-1"
                        >
                          {child.label}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-8 flex flex-col gap-3">
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener"
                onClick={() => pushEvent("click_reserva", { location: "mobile_menu" })}
                className="btn-primary"
              >
                {locale === "en" ? "Book Here" : "Reserva acá"}
              </a>
              <Link
                href={locale === "en" ? "/en/contact" : "/contacto"}
                onClick={() => {
                  pushEvent("click_contacto", { location: "mobile_menu" });
                  setMobileOpen(false);
                }}
                className="btn-outline"
              >
                {locale === "en" ? "Contact" : "Contáctanos"}
              </Link>
              <div className="mt-6 flex gap-6 text-xs uppercase tracking-widest">
                <Link href="/" onClick={() => setMobileOpen(false)}>Español</Link>
                <Link href="/en" onClick={() => setMobileOpen(false)}>English</Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
