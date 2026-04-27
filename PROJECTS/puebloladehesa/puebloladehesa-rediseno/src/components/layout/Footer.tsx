"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type FooterProps = {
  locale?: "es" | "en";
};

export default function Footer({ locale = "es" }: FooterProps) {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@puebloladehesa.cl";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56984148269";
  const address = process.env.NEXT_PUBLIC_ADDRESS || "Av. Santa Blanca 550, Lo Barnechea, Chile";
  const ig = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/puebloladehesa/";
  const fb = process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://web.facebook.com/profile.php?id=61570670461777";
  void address;

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  const pushEvent = (name: string, params: Record<string, unknown> = {}) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event: name, ...params });
    }
  };

  const submitNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail })
      });
      if (res.ok) {
        setNewsletterStatus("ok");
        setNewsletterEmail("");
        pushEvent("newsletter_subscribe", { location: "footer" });
      } else {
        setNewsletterStatus("error");
      }
    } catch {
      setNewsletterStatus("error");
    }
  };

  const exploreLinks = locale === "en"
    ? [
        { label: "About", href: "/en/about" },
        { label: "Stays", href: "/en/stays" },
        { label: "Experiences", href: "/en/experiences" },
        { label: "La Casita Gourmet", href: "/en/la-casita" },
        { label: "Location", href: "/en/location" }
      ]
    : [
        { label: "Nosotros", href: "/nosotros" },
        { label: "Estadías", href: "/estadias" },
        { label: "Experiencias", href: "/experiencias" },
        { label: "La Casita Salón Gourmet", href: "/la-casita" },
        { label: "Ubicación", href: "/ubicacion" }
      ];

  const legalLinks = locale === "en"
    ? [
        { label: "Terms & Conditions", href: "/en/terms" },
        { label: "Privacy Policy", href: "/en/privacy" }
      ]
    : [
        { label: "Términos y condiciones", href: "/legal/terminos-y-condiciones" },
        { label: "Políticas de privacidad", href: "/legal/politicas-de-privacidad" }
      ];

  return (
    <footer className="bg-brand-bg border-t border-brand-line mt-section">
      {/* Bloque principal: logo + columnas + newsletter (estructura PROD: 4 columnas) */}
      <div>
        <div className="max-w-container mx-auto px-6 lg:px-10 py-section-sm">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Logo + dirección */}
            <div className="lg:col-span-4">
              <Image
                src="/media/cdn_shop_files_logo-pueblo-01.svg"
                alt="Pueblo La Dehesa"
                width={160}
                height={50}
                className="h-10 w-auto mb-6"
              />
              <p className="text-sm text-brand-muted leading-relaxed">
                Santa Blanca 550, Lo Barnechea,<br />
                Región Metropolitana, Chile
              </p>
              <p className="text-sm text-brand-muted mt-4">
                <a href={`mailto:${email}`} onClick={() => pushEvent("click_email", { location: "footer" })} className="link-hover">{email}</a><br />
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" onClick={() => pushEvent("click_whatsapp", { location: "footer" })} className="link-hover">
                  +{whatsapp.slice(0, 2)} {whatsapp.slice(2, 3)} {whatsapp.slice(3, 7)} {whatsapp.slice(7)}
                </a>
              </p>
              {/* Redes sociales */}
              <div className="mt-6 flex gap-3">
                <a
                  href={ig}
                  target="_blank"
                  rel="noopener"
                  aria-label="Instagram"
                  onClick={() => pushEvent("click_social", { network: "instagram" })}
                  className="p-2 hover:text-brand-accent transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a
                  href={fb}
                  target="_blank"
                  rel="noopener"
                  aria-label="Facebook"
                  onClick={() => pushEvent("click_social", { network: "facebook" })}
                  className="p-2 hover:text-brand-accent transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 22v-8h3l.5-4H13V7.5c0-1.1.3-2 2-2h2V2c-.4 0-1.8-.1-3.3-.1C10.4 1.9 9 4 9 7v3H6v4h3v8h4z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Explora */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium mb-4">{locale === "en" ? "Explore" : "Explora"}</h4>
              <ul className="space-y-2 text-sm text-brand-muted">
                {exploreLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-hover">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium mb-4">{locale === "en" ? "Legal" : "Legal"}</h4>
              <ul className="space-y-2 text-sm text-brand-muted">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-hover">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-4">
              <h4 className="text-sm font-medium mb-4">
                {locale === "en"
                  ? "Join our newsletter and be the first to know"
                  : "Únete a nuestro newsletter y sé el primero en enterarte de todo"}
              </h4>
              <form onSubmit={submitNewsletter} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder={locale === "en" ? "Email address" : "Correo electrónico"}
                  className="flex-1 px-4 py-3 border border-brand-line bg-transparent text-sm focus:outline-none focus:border-brand-ink"
                  aria-label={locale === "en" ? "Email" : "Correo electrónico"}
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="btn-primary text-xs"
                >
                  {newsletterStatus === "loading" ? "…" : locale === "en" ? "Subscribe" : "Enviar"}
                </button>
              </form>
              {newsletterStatus === "ok" && (
                <p className="text-xs text-brand-accent mt-2">
                  {locale === "en" ? "Thanks! You're subscribed." : "¡Gracias! Quedaste suscrito."}
                </p>
              )}
              {newsletterStatus === "error" && (
                <p className="text-xs text-red-600 mt-2">
                  {locale === "en" ? "Something went wrong. Try again." : "Algo falló. Intenta de nuevo."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-line">
        <div className="max-w-container mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-brand-muted">
          <p>
            Copyright © {new Date().getFullYear()}, <Link href="/" className="link-hover">Pueblo La Dehesa</Link>.{" "}
            {locale === "en" ? "All rights reserved" : "Todos los derechos reservados"}
          </p>
          <p>
            {locale === "en" ? "Made by" : "Creado por"}{" "}
            <a href="https://retarget.cl" target="_blank" rel="noopener" className="link-hover text-brand-ink">
              Retarget
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
