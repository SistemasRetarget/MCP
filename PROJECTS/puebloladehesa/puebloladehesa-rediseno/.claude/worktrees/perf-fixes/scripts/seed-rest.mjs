#!/usr/bin/env node
/* Seed Payload vía REST API (evita issues ESM de Node 25 con payload CLI) */
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@puebloladehesa.cl";
const PASS = process.env.SEED_ADMIN_PASSWORD || "Admin.1234!";

function bar(label, done, total) {
  const pct = Math.round((done / total) * 100);
  const f = Math.round((pct * 30) / 100);
  process.stdout.write(`\r  [${"█".repeat(f)}${"░".repeat(30 - f)}] ${pct}% · ${done}/${total} · ${label}`.padEnd(100));
}
const lex = (paras) => ({
  root: { type: "root", format: "", indent: 0, version: 1, direction: null,
    children: (paras.length ? paras : [""]).map((t) => ({ type: "paragraph", version: 1,
      children: [{ type: "text", text: t, version: 1 }] }))
  }
});
const extractP = (e, max = 6) => [...new Set(e.texts.filter((t) => ["p","div","span"].includes(t.tag))
  .map((t) => t.text.trim()).filter((t) => t.length > 40 && t.length < 500))].slice(0, max);
const trunc = (s, n) => !s ? "" : s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";

async function api(url, opts = {}, token) {
  const r = await fetch(`${BASE}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...opts.headers
    }
  });
  const txt = await r.text();
  let body;
  try { body = JSON.parse(txt); } catch { body = txt; }
  if (!r.ok) throw new Error(`${r.status} ${url}: ${JSON.stringify(body)}`);
  return body;
}

async function main() {
  console.log("\n═══ SEED vía REST API ═══");

  // 1) Crear primer admin (o login si ya existe)
  let token;
  try {
    const r = await api("/api/users/first-register", {
      method: "POST",
      body: JSON.stringify({ email: EMAIL, password: PASS, name: "Administrador", role: "admin" })
    });
    token = r.token;
    console.log(`  ✓ Admin creado: ${EMAIL}`);
  } catch {
    const r = await api("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email: EMAIL, password: PASS })
    });
    token = r.token;
    console.log(`  · Admin existente, login OK: ${EMAIL}`);
  }

  const content = JSON.parse(fs.readFileSync(path.resolve("content-extracted/content.json"), "utf8"));
  const entries = Object.values(content);

  // 2) Casas ES
  const casasES = entries.filter((e) => e.lang === "es" && e.path.includes("/products/casa"));
  const casasEN = new Map(
    entries.filter((e) => e.lang === "en" && e.path.includes("/products/casa"))
      .map((e) => [e.path.split("/").pop(), e])
  );
  let i = 0;
  for (const h of casasES) {
    const slug = h.path.split("/").pop();
    const title = (h.meta.title || slug).split("|")[0].trim();
    const en = casasEN.get(slug);

    const existing = await api(`/api/houses?where[slug][equals]=${slug}&limit=1`, {}, token);
    const base = {
      title, slug,
      shortDescription: trunc(h.meta.description, 300),
      body: lex(extractP(h)),
      published: true,
      meta: { title: trunc(h.meta.title, 80), description: trunc(h.meta.description, 200) }
    };
    let id = existing.docs[0]?.id;
    if (!id) {
      const c = await api("/api/houses?locale=es", { method: "POST", body: JSON.stringify(base) }, token);
      id = c.doc.id;
    } else {
      await api(`/api/houses/${id}?locale=es`, { method: "PATCH", body: JSON.stringify(base) }, token);
    }
    if (en) {
      await api(`/api/houses/${id}?locale=en`, { method: "PATCH", body: JSON.stringify({
        title: (en.meta.title || slug).split("|")[0].trim(),
        shortDescription: trunc(en.meta.description, 300),
        body: lex(extractP(en)),
        meta: { title: trunc(en.meta.title, 80), description: trunc(en.meta.description, 200) }
      })}, token);
    }
    i++; bar(slug, i, casasES.length);
  }
  process.stdout.write("\n"); console.log(`  ✓ ${casasES.length} casas (ES+EN)`);

  // 3) Pages
  const defs = [
    { slug: "home", es: "/", en: "/en", t: "Home" },
    { slug: "nosotros", es: "/pages/nosotros", en: "/en/pages/nosotros", t: "Nosotros" },
    { slug: "experiencias", es: "/pages/experiencias", en: "/en/pages/experiencias", t: "Experiencias" },
    { slug: "contacto", es: "/pages/contact", en: "/en/pages/contact", t: "Contacto" }
  ];
  i = 0;
  for (const d of defs) {
    const es = entries.find((e) => e.lang === "es" && e.path === d.es);
    const en = entries.find((e) => e.lang === "en" && e.path === d.en);
    const title = (es?.meta.title || d.t).split("|")[0].trim();
    const existing = await api(`/api/pages?where[slug][equals]=${d.slug}&limit=1`, {}, token);
    const base = {
      title, slug: d.slug,
      body: lex(es ? extractP(es) : []),
      published: true,
      meta: { title: es?.meta.title || title, description: trunc(es?.meta.description, 200) }
    };
    let id = existing.docs[0]?.id;
    if (!id) {
      const c = await api("/api/pages?locale=es", { method: "POST", body: JSON.stringify(base) }, token);
      id = c.doc.id;
    } else {
      await api(`/api/pages/${id}?locale=es`, { method: "PATCH", body: JSON.stringify(base) }, token);
    }
    if (en) {
      await api(`/api/pages/${id}?locale=en`, { method: "PATCH", body: JSON.stringify({
        title: (en.meta.title || d.t).split("|")[0].trim(),
        body: lex(extractP(en)),
        meta: { title: trunc(en.meta.title, 80), description: trunc(en.meta.description, 200) }
      })}, token);
    }
    i++; bar(d.slug, i, defs.length);
  }
  process.stdout.write("\n"); console.log(`  ✓ ${defs.length} páginas (ES+EN)`);

  console.log(`\n✅ SEED COMPLETO`);
  console.log(`   → ${BASE}/admin`);
  console.log(`   → ${EMAIL} / ${PASS}\n`);
}
main().catch((e) => { console.error("\n✗", e.message); process.exit(1); });
