"use client";
import { useEffect, useState } from "react";

const KEY = "pld_consent_v1";
type Consent = "granted" | "denied";

export default function ConsentBanner() {
  const [decision, setDecision] = useState<Consent | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as Consent | null;
    if (saved) {
      setDecision(saved);
      applyConsent(saved);
    }
  }, []);

  function applyConsent(c: Consent) {
    const g = (window as any).gtag;
    if (typeof g === "function") {
      g("consent", "update", {
        ad_storage: c,
        ad_user_data: c,
        ad_personalization: c,
        analytics_storage: c
      });
    }
  }

  function choose(c: Consent) {
    localStorage.setItem(KEY, c);
    setDecision(c);
    applyConsent(c);
  }

  if (decision !== null) return null;

  return (
    <div role="dialog" aria-live="polite" aria-label="Cookies" className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-brand-soft shadow-lg">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <p className="text-sm text-brand-muted">
          Usamos cookies para analizar el uso del sitio y mejorar tu experiencia. Puedes aceptar o rechazar en cualquier momento.
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => choose("denied")} className="px-4 py-2 text-sm border border-brand-soft hover:bg-brand-soft">Rechazar</button>
          <button onClick={() => choose("granted")} className="px-4 py-2 text-sm bg-brand-ink text-white hover:bg-brand-accent">Aceptar</button>
        </div>
      </div>
    </div>
  );
}
