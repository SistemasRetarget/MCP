"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Meta (Facebook) Pixel con Consent Mode.
 * El pixel arranca en modo "revoked" y se activa cuando el usuario acepta en el banner.
 * Lee el mismo flag que ConsentBanner (localStorage pld_consent_v1).
 */
export default function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  useEffect(() => {
    if (typeof window === "undefined" || !pixelId) return;

    const saved = localStorage.getItem("pld_consent_v1");
    const fbq = (window as any).fbq;

    if (typeof fbq === "function") {
      if (saved === "granted") {
        fbq("consent", "grant");
      } else {
        fbq("consent", "revoke");
      }
    }

    // Escuchar cambios de consent
    const handler = (e: StorageEvent) => {
      if (e.key !== "pld_consent_v1") return;
      const fbq2 = (window as any).fbq;
      if (typeof fbq2 !== "function") return;
      fbq2("consent", e.newValue === "granted" ? "grant" : "revoke");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('consent', 'revoke');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
