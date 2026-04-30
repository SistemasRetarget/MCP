/**
 * Test runner — ejecuta todos los TEST_CASES del MCP.
 * Estructura conforme a IEEE 829-2008 — Standard for Software Test Documentation.
 * https://standards.ieee.org/ieee/829/4414/
 *
 * Uso CLI:
 *   node tests/run-tests.mjs [base_url]
 *
 * Uso programático:
 *   import { runAllTests } from "./tests/run-tests.mjs";
 *   const results = await runAllTests({ baseUrl: "https://..." });
 *
 * Resultado: { meta, summary, cases: [{ id, name, verdict, ... }] }
 * verdict ∈ { PASS | FAIL | ERROR | SKIP }
 */

import { TEST_CASES, TEST_META } from "./cases.mjs";
import * as fsp from "fs/promises";

export async function runAllTests({ baseUrl, only = null, fetch: fetchFn = globalThis.fetch } = {}) {
  if (!baseUrl) baseUrl = process.env.BASE_URL || "https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app";

  const cases = only ? TEST_CASES.filter(c => only.includes(c.id)) : TEST_CASES;
  const results = [];
  const startedAt = Date.now();

  for (const tc of cases) {
    const t0 = Date.now();
    let verdict = "PASS", error = null, details = null;
    try {
      details = await Promise.race([
        tc.run({ baseUrl, fetch: fetchFn, fs: fsp }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout 15s")), 15_000)),
      ]);
    } catch (e) {
      verdict = e.message?.startsWith("timeout") ? "ERROR" : "FAIL";
      error = e.message || String(e);
    }
    results.push({
      id: tc.id,
      name: tc.name,
      severity: tc.severity || "medium",
      nist_principle: tc.nist_principle,
      framework: tc.framework,
      framework_url: tc.framework_url,
      description: tc.description,
      verdict,
      elapsed_ms: Date.now() - t0,
      error,
      details,
      ran_at: new Date().toISOString(),
    });
  }

  const summary = {
    total: results.length,
    pass: results.filter(r => r.verdict === "PASS").length,
    fail: results.filter(r => r.verdict === "FAIL").length,
    error: results.filter(r => r.verdict === "ERROR").length,
    skip: results.filter(r => r.verdict === "SKIP").length,
    pass_rate: results.length ? Math.round((results.filter(r => r.verdict === "PASS").length / results.length) * 100) : 0,
    by_principle: {},
    elapsed_total_ms: Date.now() - startedAt,
  };
  for (const r of results) {
    const k = r.nist_principle;
    summary.by_principle[k] = summary.by_principle[k] || { total: 0, pass: 0 };
    summary.by_principle[k].total++;
    if (r.verdict === "PASS") summary.by_principle[k].pass++;
  }

  return {
    meta: { ...TEST_META, base_url: baseUrl, ran_at: new Date().toISOString() },
    summary,
    cases: results,
  };
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.argv[2] || process.env.BASE_URL;
  const out = await runAllTests({ baseUrl });
  console.log("\n══ MCP TEST SUITE — IEEE 829-2008 ══");
  console.log(`Base: ${out.meta.base_url}`);
  console.log(`Framework: ${out.meta.framework_primary}`);
  console.log(`\nResumen: ${out.summary.pass}/${out.summary.total} PASS (${out.summary.pass_rate}%)`);
  console.log(`Duración: ${out.summary.elapsed_total_ms}ms\n`);
  for (const c of out.cases) {
    const icon = c.verdict === "PASS" ? "✅" : c.verdict === "FAIL" ? "❌" : "⚠️";
    console.log(`${icon} ${c.id} ${c.name} (${c.elapsed_ms}ms)`);
    if (c.error) console.log(`   → ${c.error}`);
  }
  process.exit(out.summary.fail + out.summary.error > 0 ? 1 : 0);
}
