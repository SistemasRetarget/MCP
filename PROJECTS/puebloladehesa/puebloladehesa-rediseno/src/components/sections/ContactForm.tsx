"use client";

import { useState } from "react";
import { track } from "@/lib/tracking";

type Props = {
  title: string;
  description: string;
  locale?: "es" | "en";
};

export default function ContactForm({ title, description, locale = "es" }: Props) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [k]: e.target.value });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || (locale === "en" ? "Could not send. Try again." : "No se pudo enviar. Intenta de nuevo."));
        setStatus("error");
        return;
      }
      track("form_submit_contacto", { location: "home", locale });
      setStatus("ok");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setErrorMsg(locale === "en" ? "Connection error." : "Error de conexión.");
      setStatus("error");
    }
  };

  const label = (es: string, en: string) => (locale === "en" ? en : es);

  return (
    <section className="py-section px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-display-md mb-4">{title}</h2>
          <p className="text-base md:text-lg text-brand-muted leading-relaxed">
            {description}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label={label("Nombre", "Name")}
              name="name"
              value={form.name}
              onChange={update("name")}
            />
            <Field
              label={label("Correo electrónico", "Email")}
              name="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              required
            />
          </div>
          <Field
            label={label("Teléfono", "Phone")}
            name="phone"
            type="tel"
            value={form.phone}
            onChange={update("phone")}
          />
          <div>
            <label className="block text-xs uppercase tracking-widest text-brand-muted mb-2">
              {label("Mensaje", "Message")}
            </label>
            <textarea
              name="message"
              rows={5}
              value={form.message}
              onChange={update("message")}
              className="w-full border border-brand-line bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-brand-ink resize-none"
            />
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary min-w-[200px] disabled:opacity-60"
            >
              {status === "loading" ? "…" : label("Enviar", "Send")}
            </button>
          </div>

          {status === "ok" && (
            <p className="text-center text-sm text-brand-accent">
              {label("¡Gracias! Te contactaremos pronto.", "Thanks! We'll be in touch soon.")}
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-sm text-red-600">{errorMsg}</p>
          )}

          <p className="text-xs text-brand-muted text-center pt-2">
            {label(
              "Este sitio está protegido por reCAPTCHA y se aplican las Políticas de Privacidad y Condiciones de servicio.",
              "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply."
            )}
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs uppercase tracking-widest text-brand-muted mb-2">
        {label} {required && <span className="text-brand-accent">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-brand-line bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-brand-ink"
      />
    </div>
  );
}
