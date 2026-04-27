import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "unknown";
  const rl = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Demasiadas solicitudes, espera un minuto." }, { status: 429 });
  }

  const form = await req.formData();
  const raw: Record<string, string> = {};
  form.forEach((v, k) => { if (typeof v === "string") raw[k] = v; });

  const result = validateContact(raw);
  const lang = (raw.lang === "en" ? "en" : "es") as "es" | "en";
  const redirectBase = lang === "en" ? "/en/contact" : "/contacto";

  if (!result.ok) {
    const url = new URL(`${redirectBase}?error=${encodeURIComponent(result.errors.join(","))}`, req.url);
    return NextResponse.redirect(url, 303);
  }

  // TODO: enviar email con nodemailer/resend, o guardar en DB
  console.log("[contacto]", { ...result.data, ip });

  return NextResponse.redirect(new URL(`${redirectBase}?ok=1`, req.url), 303);
}
