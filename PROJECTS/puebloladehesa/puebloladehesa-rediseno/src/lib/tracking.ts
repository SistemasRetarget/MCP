/**
 * Utility para pushar eventos al dataLayer (GTM) y a Meta Pixel (fbq).
 * GTM maneja enrutado a GA4 + cualquier otro tag via container.
 *
 * Uso:
 *   import { track } from "@/lib/tracking";
 *   track("click_reserva", { location: "hero", house: "casa-parque" });
 */

type TrackParams = Record<string, unknown>;

export function track(eventName: string, params: TrackParams = {}): void {
  if (typeof window === "undefined") return;

  // GTM dataLayer
  const dl = (window as any).dataLayer;
  if (Array.isArray(dl)) {
    dl.push({ event: eventName, ...params });
  }

  // Meta Pixel (mapea eventos custom → standard cuando aplica)
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") {
    const pixelEvent = mapToMetaEvent(eventName);
    if (pixelEvent?.standard) {
      fbq("track", pixelEvent.name, params);
    } else if (pixelEvent?.custom) {
      fbq("trackCustom", pixelEvent.name, params);
    }
  }
}

function mapToMetaEvent(name: string): { name: string; standard?: boolean; custom?: boolean } | null {
  switch (name) {
    case "click_reserva":
      return { name: "InitiateCheckout", standard: true };
    case "click_contacto":
    case "click_whatsapp":
      return { name: "Contact", standard: true };
    case "form_submit_contacto":
      return { name: "Lead", standard: true };
    case "view_casa":
      return { name: "ViewContent", standard: true };
    case "newsletter_subscribe":
      return { name: "Subscribe", standard: true };
    case "click_social":
    case "click_email":
      return { name, custom: true };
    default:
      return { name, custom: true };
  }
}

/**
 * Hook sencillo para trackear page view en cambios de ruta.
 * Ya no es necesario en GA4 (automático) pero sí para Meta Pixel en SPAs.
 */
export function trackPageView(url: string): void {
  if (typeof window === "undefined") return;
  const dl = (window as any).dataLayer;
  if (Array.isArray(dl)) dl.push({ event: "page_view", page_path: url });
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") fbq("track", "PageView");
}
