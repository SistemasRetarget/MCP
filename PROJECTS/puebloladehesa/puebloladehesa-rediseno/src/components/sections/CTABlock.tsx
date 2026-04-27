"use client";

import Link from "next/link";
import { track } from "@/lib/tracking";

type Props = {
  title: string;
  description?: string;
  bookingLabel: string;
  contactLabel: string;
  locale?: "es" | "en";
};

export default function CTABlock({ title, description, bookingLabel, contactLabel, locale = "es" }: Props) {
  const booking = process.env.NEXT_PUBLIC_BOOKING_URL || "https://puebloladehesa.book2dream.com/";
  const contactHref = locale === "en" ? "/en/contact" : "/contacto";

  return (
    <section className="py-section-sm px-6 bg-brand-cream">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-display-md mb-4">{title}</h2>
        {description && (
          <p className="text-base md:text-lg text-brand-muted mb-10 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={booking}
            target="_blank"
            rel="noopener"
            onClick={() => track("click_reserva", { location: "cta_block" })}
            className="btn-primary"
          >
            {bookingLabel}
          </a>
          <Link
            href={contactHref}
            onClick={() => track("click_contacto", { location: "cta_block" })}
            className="btn-outline"
          >
            {contactLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
