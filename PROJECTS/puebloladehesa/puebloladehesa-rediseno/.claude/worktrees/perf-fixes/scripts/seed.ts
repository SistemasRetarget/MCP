#!/usr/bin/env tsx
/* Seed Payload CMS desde content-extracted/ */
import { getPayload } from "payload";
import config from "../payload.config.js";
import fs from "node:fs";
import path from "node:path";

type ContentEntry = {
  url: string;
  lang: "es" | "en";
  path: string;
  meta: Record<string, string>;
  texts: { tag: string; text: string }[];
};

const ROOT = path.resolve(process.cwd(), "content-extracted");

function progress(label: string, done: number, total: number) {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round((pct * 30) / 100);
  const bar = "█".repeat(filled) + "░".repeat(30 - filled);
  process.stdout.write(`\r  [${bar}] ${pct}% · ${done}/${total} · ${label}`.padEnd(100));
}

function lexicalParagraph(text: string) {
  return {
    type: "paragraph",
    version: 1,
    children: [{ type: "text", text, version: 1 }]
  };
}
function lexicalRoot(paragraphs: string[]) {
  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: null,
      children: paragraphs.length > 0 ? paragraphs.map(lexicalParagraph) : [lexicalParagraph("")]
    }
  };
}
function extractParagraphs(entry: ContentEntry, max = 6): string[] {
  return Array.from(
    new Set(
      entry.texts
        .filter((t) => ["p", "div", "span"].includes(t.tag))
        .map((t) => t.text.trim())
        .filter((t) => t.length > 40 && t.length < 500)
    )
  ).slice(0, max);
}

async function main() {
  console.log("\n═══ SEEDING PAYLOAD DESDE content-extracted ═══");

  const payload = await getPayload({ config });
  const contentRaw = JSON.parse(fs.readFileSync(path.join(ROOT, "content.json"), "utf8")) as Record<string, ContentEntry>;
  const entries = Object.values(contentRaw);

  // 1) Admin user si no existe
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@puebloladehesa.cl";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "Admin.1234!";
  const existing = await payload.find({ collection: "users", where: { email: { equals: adminEmail } }, limit: 1 });
  if (existing.totalDocs === 0) {
    await payload.create({
      collection: "users",
      data: { email: adminEmail, password: adminPass, name: "Administrador", role: "admin" }
    });
    console.log(`  ✓ Usuario admin creado: ${adminEmail} / ${adminPass}`);
  } else {
    console.log(`  · Usuario admin ya existe: ${adminEmail}`);
  }

  // 2) Casas (solo ES como base, EN como locale)
  const housesEs = entries.filter((e) => e.lang === "es" && e.path.includes("/products/casa"));
  const housesEn = entries.filter((e) => e.lang === "en" && e.path.includes("/products/casa"));
  const mapEn = new Map(housesEn.map((h) => [h.path.split("/").pop(), h]));

  let done = 0;
  for (const h of housesEs) {
    const slug = h.path.split("/").pop()!;
    const title = h.meta.title?.split("|")[0].trim() || slug;
    const en = mapEn.get(slug);
    const paras = extractParagraphs(h, 6);
    const parasEn = en ? extractParagraphs(en, 6) : [];

    const existingHouse = await payload.find({ collection: "houses", where: { slug: { equals: slug } }, limit: 1 });
    const data = {
      title,
      slug,
      shortDescription: h.meta.description || "",
      body: lexicalRoot(paras),
      published: true,
      meta: { title: h.meta.title, description: h.meta.description }
    };

    let id: string | number;
    if (existingHouse.totalDocs > 0) {
      id = existingHouse.docs[0].id;
      await payload.update({ collection: "houses", id, data, locale: "es" });
    } else {
      const created = await payload.create({ collection: "houses", data, locale: "es" });
      id = created.id;
    }
    if (en) {
      await payload.update({
        collection: "houses",
        id,
        data: {
          title: en.meta.title?.split("|")[0].trim() || title,
          shortDescription: en.meta.description || "",
          body: lexicalRoot(parasEn),
          meta: { title: en.meta.title, description: en.meta.description }
        },
        locale: "en"
      });
    }
    done++;
    progress(slug, done, housesEs.length);
  }
  process.stdout.write("\n");
  console.log(`  ✓ ${housesEs.length} casas importadas (ES + EN locale)`);

  // 3) Pages: home, nosotros, experiencias, contacto
  const pagesMap: Array<{ slug: string; esPath: string; enPath: string; defaultTitle: string }> = [
    { slug: "home", esPath: "/", enPath: "/en", defaultTitle: "Home" },
    { slug: "nosotros", esPath: "/pages/nosotros", enPath: "/en/pages/nosotros", defaultTitle: "Nosotros" },
    { slug: "experiencias", esPath: "/pages/experiencias", enPath: "/en/pages/experiencias", defaultTitle: "Experiencias" },
    { slug: "contacto", esPath: "/pages/contact", enPath: "/en/pages/contact", defaultTitle: "Contacto" }
  ];

  done = 0;
  for (const p of pagesMap) {
    const es = entries.find((e) => e.lang === "es" && e.path === p.esPath);
    const en = entries.find((e) => e.lang === "en" && e.path === p.enPath);
    const title = es?.meta.title?.split("|")[0].trim() || p.defaultTitle;
    const paras = es ? extractParagraphs(es, 6) : [];
    const parasEn = en ? extractParagraphs(en, 6) : [];

    const existingPage = await payload.find({ collection: "pages", where: { slug: { equals: p.slug } }, limit: 1 });
    const data = {
      title,
      slug: p.slug,
      body: lexicalRoot(paras),
      published: true,
      meta: { title: es?.meta.title || title, description: es?.meta.description || "" }
    };
    let id: string | number;
    if (existingPage.totalDocs > 0) {
      id = existingPage.docs[0].id;
      await payload.update({ collection: "pages", id, data, locale: "es" });
    } else {
      const created = await payload.create({ collection: "pages", data, locale: "es" });
      id = created.id;
    }
    if (en) {
      await payload.update({
        collection: "pages",
        id,
        data: {
          title: en.meta.title?.split("|")[0].trim() || p.defaultTitle,
          body: lexicalRoot(parasEn),
          meta: { title: en.meta.title, description: en.meta.description }
        },
        locale: "en"
      });
    }
    done++;
    progress(p.slug, done, pagesMap.length);
  }
  process.stdout.write("\n");
  console.log(`  ✓ ${pagesMap.length} páginas importadas`);

  console.log("\n✅ Seed completo.\n   → http://localhost:3000/admin");
  console.log(`   → email: ${adminEmail}`);
  console.log(`   → pass:  ${adminPass}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Seed falló:", err);
  process.exit(1);
});
