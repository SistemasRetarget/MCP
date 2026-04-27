#!/usr/bin/env python3
"""
Extrae TODO el contenido del sitio puebloladehesa.cl:
- Todas las páginas en ES y EN
- Todas las imágenes del CDN de Shopify
- Todos los textos estructurados por sección
- Metadatos SEO por página

Uso:
    python3 scripts/extract_content.py
"""
import os
import re
import sys
import json
import time
import urllib.request
import urllib.parse
from pathlib import Path
from html.parser import HTMLParser

BASE_DIR = Path(__file__).parent.parent
OUTPUT_DIR = BASE_DIR / "content-extracted"
IMAGES_DIR = OUTPUT_DIR / "images"
PAGES_DIR = OUTPUT_DIR / "pages"
TEXT_DIR = OUTPUT_DIR / "text"

SITE = "https://puebloladehesa.cl"

# Rutas se descubren desde el sitemap
SITEMAP = f"{SITE}/sitemap.xml"

# ─────────────────────────────────────────────────────────
# Progress bar
# ─────────────────────────────────────────────────────────
def progress(step, total, label, extra=""):
    pct = int(100 * step / total)
    bar_len = 30
    filled = int(bar_len * step / total)
    bar = "█" * filled + "░" * (bar_len - filled)
    sys.stdout.write(f"\r[{bar}] {pct:3d}% · {label}  {extra}")
    sys.stdout.flush()
    if step == total:
        print()

def log(msg):
    print(f"\n▶ {msg}")

# ─────────────────────────────────────────────────────────
# HTML → extract images, texts, metadata
# ─────────────────────────────────────────────────────────
class ContentExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = set()
        self.texts = []
        self.meta = {}
        self.current_tag = None
        self.current_attrs = {}
        self.current_text = []
        self.in_skip = False

    def handle_starttag(self, tag, attrs):
        attrs_d = dict(attrs)
        self.current_tag = tag
        self.current_attrs = attrs_d

        if tag in ("script", "style", "noscript"):
            self.in_skip = True
            return

        # Meta tags
        if tag == "meta":
            name = attrs_d.get("name") or attrs_d.get("property")
            if name and attrs_d.get("content"):
                self.meta[name] = attrs_d["content"]

        if tag == "title":
            self.current_text = []

        # Images
        if tag == "img":
            src = attrs_d.get("src", "")
            srcset = attrs_d.get("srcset", "")
            alt = attrs_d.get("alt", "")
            if src:
                self.images.add((src, alt))
            if srcset:
                for part in srcset.split(","):
                    url = part.strip().split(" ")[0]
                    if url:
                        self.images.add((url, alt))

        # Inline CSS backgrounds
        style = attrs_d.get("style", "")
        if "url(" in style:
            for m in re.finditer(r'url\(["\']?([^)"\']+)', style):
                self.images.add((m.group(1), ""))

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.in_skip = False
        if tag == "title" and self.current_text:
            self.meta["title"] = "".join(self.current_text).strip()

    def handle_data(self, data):
        if self.in_skip:
            return
        text = data.strip()
        if text and len(text) > 2 and self.current_tag not in ("script", "style"):
            self.texts.append({
                "tag": self.current_tag,
                "class": self.current_attrs.get("class", ""),
                "text": text
            })
            self.current_text.append(text)

# ─────────────────────────────────────────────────────────
# Download helpers
# ─────────────────────────────────────────────────────────
def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

def normalize_url(url, base=SITE):
    if url.startswith("//"):
        return "https:" + url
    if url.startswith("/"):
        return base + url
    return url

def safe_filename(url):
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.lstrip("/")
    fname = path.replace("/", "_")
    # Remove query but keep extension
    if "." in fname:
        name, ext = fname.rsplit(".", 1)
        ext = ext.split("?")[0].split("&")[0]
        fname = f"{name}.{ext}"
    return fname[:200]  # limit length

# ─────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────
def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    IMAGES_DIR.mkdir(exist_ok=True)
    PAGES_DIR.mkdir(exist_ok=True)
    TEXT_DIR.mkdir(exist_ok=True)

    # ─── Discover routes from sitemap ───
    log("PASO 0/4 · Descubriendo rutas desde sitemap.xml")
    all_routes = []
    try:
        sitemap_root = fetch(SITEMAP).decode("utf-8", errors="ignore")
        sub_sitemaps = re.findall(r'<loc>([^<]+)</loc>', sitemap_root)
        total_sm = len(sub_sitemaps)
        for i, sm_url in enumerate(sub_sitemaps, 1):
            progress(i, total_sm, f"sitemap {i}/{total_sm}")
            try:
                sm_content = fetch(sm_url).decode("utf-8", errors="ignore")
                for loc in re.findall(r'<loc>([^<]+)</loc>', sm_content):
                    loc = loc.replace("&amp;", "&")
                    path = loc.replace(SITE, "")
                    lang = "en" if path.startswith("/en") else "es"
                    # Skip XML sitemap files themselves
                    if path.endswith(".xml"):
                        continue
                    all_routes.append((lang, path))
            except Exception as e:
                print(f"\n  ✗ Error sub-sitemap {sm_url}: {e}")
            time.sleep(0.1)
    except Exception as e:
        print(f"  ✗ Error sitemap principal: {e}")
        # Fallback
        all_routes = [("es", "/"), ("en", "/en")]

    # Dedup and cap to reasonable limit
    all_routes = list(dict.fromkeys(all_routes))
    print(f"  ✓ {len(all_routes)} rutas descubiertas desde sitemap")
    total_pages = len(all_routes)

    all_images = {}  # url -> (alt, pages)
    all_content = {}

    # ─── STEP 1: Download pages ───
    log(f"PASO 1/4 · Descargando {total_pages} páginas (ES + EN)")
    for i, (lang, path) in enumerate(all_routes, 1):
        url = SITE + path
        progress(i, total_pages, f"GET {lang} {path}")
        try:
            html = fetch(url).decode("utf-8", errors="ignore")
            page_key = f"{lang}{path.replace('/','_') or '_home'}"
            page_file = PAGES_DIR / f"{page_key}.html"
            page_file.write_text(html)

            extractor = ContentExtractor()
            extractor.feed(html)

            all_content[page_key] = {
                "url": url,
                "lang": lang,
                "path": path,
                "meta": extractor.meta,
                "texts": extractor.texts,
                "images_count": len(extractor.images),
            }

            for src, alt in extractor.images:
                full_url = normalize_url(src)
                if full_url not in all_images:
                    all_images[full_url] = {"alt": alt, "pages": []}
                all_images[full_url]["pages"].append(page_key)

            time.sleep(0.3)  # be polite
        except Exception as e:
            print(f"\n  ✗ Error en {url}: {e}")

    print(f"  ✓ {len(all_content)} páginas descargadas, {len(all_images)} imágenes únicas detectadas")

    # ─── STEP 2: Filter Shopify CDN images only ───
    log("PASO 2/4 · Filtrando imágenes del CDN de Shopify")
    shopify_images = {u: d for u, d in all_images.items()
                      if "cdn.shopify.com" in u or "puebloladehesa.cl/cdn" in u}
    # Clean URLs: strip tracking params, keep version
    cleaned = {}
    for url, data in shopify_images.items():
        # Parse and rebuild URL properly to strip only size/crop params
        parsed = urllib.parse.urlparse(url)
        qs = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        qs_clean = [(k, v) for k, v in qs if k not in ("crop", "width", "height")]
        new_q = urllib.parse.urlencode(qs_clean)
        base_url = urllib.parse.urlunparse(parsed._replace(query=new_q))
        cleaned[base_url] = data
    shopify_images = cleaned
    print(f"  ✓ {len(shopify_images)} imágenes del CDN Shopify identificadas")

    # ─── STEP 3: Download images ───
    log(f"PASO 3/4 · Descargando {len(shopify_images)} imágenes")
    downloaded = 0
    skipped = 0
    errors = []
    total_img = len(shopify_images)
    image_manifest = []

    for i, (url, data) in enumerate(shopify_images.items(), 1):
        fname = safe_filename(url)
        if not fname or "." not in fname:
            fname = f"image_{i}.jpg"
        out_path = IMAGES_DIR / fname
        progress(i, total_img, f"IMG {i}/{total_img}", f"({fname[:40]})")

        if out_path.exists() and out_path.stat().st_size > 0:
            skipped += 1
            image_manifest.append({
                "url": url, "file": fname, "alt": data["alt"],
                "pages": data["pages"], "size": out_path.stat().st_size
            })
            continue

        try:
            content = fetch(url, timeout=60)
            out_path.write_bytes(content)
            downloaded += 1
            image_manifest.append({
                "url": url, "file": fname, "alt": data["alt"],
                "pages": data["pages"], "size": len(content)
            })
        except Exception as e:
            errors.append((url, str(e)))
        time.sleep(0.1)

    print(f"  ✓ Descargadas: {downloaded}  ·  Ya existían: {skipped}  ·  Errores: {len(errors)}")
    if errors:
        (OUTPUT_DIR / "download_errors.log").write_text(
            "\n".join(f"{u}\t{e}" for u, e in errors)
        )

    # ─── STEP 4: Extract structured content ───
    log("PASO 4/4 · Extrayendo contenido estructurado (textos + metadatos)")

    # Save full content JSON
    with (OUTPUT_DIR / "content.json").open("w") as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False)
    progress(1, 4, "content.json")

    # Save image manifest
    with (OUTPUT_DIR / "images.json").open("w") as f:
        json.dump(image_manifest, f, indent=2, ensure_ascii=False)
    progress(2, 4, "images.json")

    # Save texts by language (flat, unique, sorted by length)
    by_lang = {"es": [], "en": []}
    seen = {"es": set(), "en": set()}
    for page_key, page in all_content.items():
        lang = page["lang"]
        for t in page["texts"]:
            txt = t["text"]
            if len(txt) > 10 and txt not in seen[lang]:
                seen[lang].add(txt)
                by_lang[lang].append({
                    "page": page_key,
                    "tag": t["tag"],
                    "class": t["class"],
                    "text": txt
                })

    for lang, items in by_lang.items():
        with (TEXT_DIR / f"texts_{lang}.json").open("w") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)

    progress(3, 4, "texts_*.json")

    # Human readable summary
    summary_lines = [
        "# Resumen de extracción\n",
        f"**Fecha:** {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Sitio:** {SITE}\n",
        "## Páginas descargadas\n",
    ]
    for page_key, page in all_content.items():
        title = page["meta"].get("title", "(sin título)")
        summary_lines.append(f"- **{page_key}** ({page['lang']}) · {title}")
        summary_lines.append(f"  - URL: {page['url']}")
        summary_lines.append(f"  - Textos extraídos: {len(page['texts'])}")
        summary_lines.append(f"  - Imágenes: {page['images_count']}")
    summary_lines.append("")
    summary_lines.append("## Imágenes")
    summary_lines.append(f"- Total únicas detectadas: {len(all_images)}")
    summary_lines.append(f"- Del CDN Shopify: {len(shopify_images)}")
    summary_lines.append(f"- Descargadas exitosamente: {downloaded + skipped}")
    summary_lines.append(f"- Errores: {len(errors)}")
    summary_lines.append("")
    summary_lines.append("## Textos únicos por idioma")
    for lang, items in by_lang.items():
        summary_lines.append(f"- **{lang.upper()}:** {len(items)} textos únicos")

    (OUTPUT_DIR / "RESUMEN.md").write_text("\n".join(summary_lines))
    progress(4, 4, "RESUMEN.md")

    # ─── Final summary ───
    print()
    print("━" * 60)
    print("✅ EXTRACCIÓN COMPLETADA")
    print("━" * 60)
    print(f"📁 Output: {OUTPUT_DIR}")
    print(f"   ├── pages/        ({len(all_content)} archivos HTML)")
    print(f"   ├── images/       ({downloaded + skipped} imágenes)")
    print(f"   ├── text/         (2 JSON — es/en)")
    print(f"   ├── content.json  (contenido completo estructurado)")
    print(f"   ├── images.json   (manifest de imágenes)")
    print(f"   └── RESUMEN.md    (resumen humano)")
    print()
    print(f"💾 Peso total imágenes: ", end="")
    total_size = sum(f.stat().st_size for f in IMAGES_DIR.iterdir() if f.is_file())
    print(f"{total_size / 1024 / 1024:.1f} MB")
    print()

if __name__ == "__main__":
    main()
