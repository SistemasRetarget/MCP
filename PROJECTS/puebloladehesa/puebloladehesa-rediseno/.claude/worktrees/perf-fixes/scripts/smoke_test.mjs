#!/usr/bin/env node
// Smoke test: valida que todas las rutas principales devuelvan 200.
const BASE = process.env.SMOKE_URL || "http://localhost:3000";
const routes = ["/", "/casas", "/casas/casa-doble-altura", "/casas/casa-parque", "/casas/casa-panoramica", "/casas/casa-suite", "/experiencias", "/nosotros", "/contacto", "/sitemap.xml", "/robots.txt"];

console.log(`\n═══ SMOKE TEST · ${BASE} ═══`);
let ok = 0, fail = 0;
for (const [i, r] of routes.entries()) {
  process.stdout.write(`\r  [${"█".repeat(Math.round((i+1)*30/routes.length)).padEnd(30,"░")}] ${i+1}/${routes.length} ${r}`.padEnd(100));
  try {
    const res = await fetch(BASE + r);
    if (res.status === 200) ok++; else { fail++; console.log(`\n  ✗ ${r} → ${res.status}`); }
  } catch (e) { fail++; console.log(`\n  ✗ ${r} → ${e.message}`); }
}
console.log(`\n  Resultado: ${ok}/${routes.length} OK, ${fail} fallos`);
process.exit(fail === 0 ? 0 : 1);
