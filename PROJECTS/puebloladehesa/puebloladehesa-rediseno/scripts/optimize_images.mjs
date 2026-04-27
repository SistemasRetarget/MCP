#!/usr/bin/env node
// Optimiza imágenes de public/media: genera WebP + AVIF redimensionadas para LCP.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve("public/media");
const files = fs.readdirSync(DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const SIZES = [640, 1080, 1920];
const total = files.length * SIZES.length * 2; // webp + avif
let done = 0;
const startSize = files.reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0);

function bar() {
  const pct = Math.round((done / total) * 100);
  const filled = Math.round(pct * 30 / 100);
  const b = "█".repeat(filled) + "░".repeat(30 - filled);
  process.stdout.write(`\r  [${b}] ${pct}% · ${done}/${total}`);
}

console.log(`\n═══ OPTIMIZANDO ${files.length} imágenes → ${total} variantes (WebP+AVIF × 3 tamaños) ═══`);
console.time("  duración");

for (const file of files) {
  const base = path.parse(file).name;
  const src = path.join(DIR, file);
  for (const w of SIZES) {
    for (const fmt of ["webp", "avif"]) {
      const out = path.join(DIR, `${base}-${w}.${fmt}`);
      if (!fs.existsSync(out)) {
        try {
          await sharp(src)
            .resize({ width: w, withoutEnlargement: true })
            [fmt]({ quality: fmt === "avif" ? 55 : 75 })
            .toFile(out);
        } catch (e) {
          // ignore errors (corrupt images)
        }
      }
      done++;
      if (done % 10 === 0 || done === total) bar();
    }
  }
}
console.log();
console.timeEnd("  duración");

const endFiles = fs.readdirSync(DIR);
const endSize = endFiles.reduce((s, f) => s + fs.statSync(path.join(DIR, f)).size, 0);
console.log(`  ✓ ${endFiles.length} archivos · antes ${(startSize / 1024 / 1024).toFixed(1)} MB → ahora ${(endSize / 1024 / 1024).toFixed(1)} MB`);
