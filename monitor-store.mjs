/**
 * Monitor Store — vigila campañas activas (prioridad puyehue.cl).
 *
 * Schedule: 4 checks/día (00:00, 07:00, 12:00, 18:00) vía Cloud Scheduler → endpoint MCP.
 *
 * Qué se vigila por URL:
 *   - Disponibilidad (HTTP status, latencia)
 *   - Integridad visual (screenshot vs baseline, pixel diff)
 *   - Performance/SEO (Lighthouse — solo en check de las 12:00 para no saturar)
 *   - CTA presente (selector existe en DOM)
 *
 * URLs origen:
 *   - Manual (lista en monitor-config.json)
 *   - Meta Ads API (TODO: requiere credenciales)
 *   - Google Ads API (TODO: requiere credenciales)
 *
 * Storage: projects-data/monitor.json
 *   - urls: lista de URLs activas con su config (selector CTA, baseline, etc.)
 *   - checks: historial de checks (ring buffer últimos 200 por URL)
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "projects-data");
const FILE = join(DATA_DIR, "monitor.json");

const MAX_HISTORY_PER_URL = 200;

const VALID_SOURCES = ["manual", "meta_ads", "google_ads"];

function ensureDir() {
  try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function load() {
  ensureDir();
  if (!existsSync(FILE)) return { urls: [], checks: {} };
  try { return JSON.parse(readFileSync(FILE, "utf8")); } catch { return { urls: [], checks: {} }; }
}

function save(data) {
  ensureDir();
  try { writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8"); }
  catch (err) { console.error(`[monitor-store] save failed: ${err.message}`); }
}

function urlKey(u) {
  return String(u).trim().toLowerCase();
}

/**
 * Registra una URL para monitoreo.
 * payload: { url, project_id, source, label, cta_selector?, campaign_meta? }
 */
export function addUrl(payload) {
  if (!payload || !payload.url) throw new Error("url requerida");
  const data = load();
  const key = urlKey(payload.url);
  if (data.urls.find(u => urlKey(u.url) === key)) {
    throw new Error(`URL ya monitoreada: ${payload.url}`);
  }
  const now = new Date().toISOString();
  const entry = {
    url: payload.url,
    project_id: payload.project_id || "general",
    source: VALID_SOURCES.includes(payload.source) ? payload.source : "manual",
    label: payload.label || payload.url,
    cta_selector: payload.cta_selector || null,
    baseline_screenshot_url: null,
    campaign_meta: payload.campaign_meta || null,
    active: true,
    created_at: now,
    updated_at: now,
  };
  data.urls.push(entry);
  save(data);
  return entry;
}

export function listUrls(filter = {}) {
  const data = load();
  let items = data.urls || [];
  if (filter.project_id) items = items.filter(u => u.project_id === filter.project_id);
  if (filter.source) items = items.filter(u => u.source === filter.source);
  if (filter.active !== undefined) items = items.filter(u => u.active === filter.active);
  return items;
}

export function getUrl(url) {
  const data = load();
  const key = urlKey(url);
  return (data.urls || []).find(u => urlKey(u.url) === key) || null;
}

export function updateUrl(url, changes = {}) {
  const data = load();
  const key = urlKey(url);
  const idx = (data.urls || []).findIndex(u => urlKey(u.url) === key);
  if (idx === -1) throw new Error(`URL no encontrada: ${url}`);
  const u = data.urls[idx];
  if (changes.label !== undefined) u.label = String(changes.label).slice(0, 200);
  if (changes.cta_selector !== undefined) u.cta_selector = changes.cta_selector;
  if (changes.baseline_screenshot_url !== undefined) u.baseline_screenshot_url = changes.baseline_screenshot_url;
  if (changes.active !== undefined) u.active = !!changes.active;
  if (changes.campaign_meta !== undefined) u.campaign_meta = changes.campaign_meta;
  u.updated_at = new Date().toISOString();
  data.urls[idx] = u;
  save(data);
  return u;
}

export function removeUrl(url) {
  const data = load();
  const key = urlKey(url);
  data.urls = (data.urls || []).filter(u => urlKey(u.url) !== key);
  delete (data.checks || {})[key];
  save(data);
  return true;
}

/**
 * Registra el resultado de un check.
 * result: {
 *   url, ts, http_status, latency_ms, ok,
 *   visual_diff_pct?, perf_score?, cta_found?, error?
 * }
 */
export function recordCheck(result) {
  if (!result || !result.url) throw new Error("url requerida en result");
  const data = load();
  const key = urlKey(result.url);
  if (!data.checks) data.checks = {};
  if (!data.checks[key]) data.checks[key] = [];
  const entry = {
    ts: result.ts || new Date().toISOString(),
    http_status: result.http_status ?? null,
    latency_ms: result.latency_ms ?? null,
    ok: !!result.ok,
    visual_diff_pct: result.visual_diff_pct ?? null,
    perf_score: result.perf_score ?? null,
    cta_found: result.cta_found ?? null,
    error: result.error || null,
    severity: classifySeverity(result),
  };
  data.checks[key].unshift(entry);
  if (data.checks[key].length > MAX_HISTORY_PER_URL) {
    data.checks[key].length = MAX_HISTORY_PER_URL;
  }
  save(data);
  return entry;
}

/**
 * Clasifica severidad para alertas.
 *  - critical: caída (5xx/4xx) o diff visual >10% o CTA no encontrado en URL con CTA configurado
 *  - warning : latencia alta (>5s) o diff visual entre 3-10% o perf <50
 *  - ok      : todo dentro de tolerancias
 */
function classifySeverity(r) {
  if (r.error) return "critical";
  if (r.http_status && (r.http_status >= 400)) return "critical";
  if (r.visual_diff_pct !== undefined && r.visual_diff_pct !== null) {
    if (r.visual_diff_pct >= 10) return "critical";
    if (r.visual_diff_pct >= 3) return "warning";
  }
  if (r.cta_found === false) return "critical";
  if (r.latency_ms && r.latency_ms > 5000) return "warning";
  if (r.perf_score !== undefined && r.perf_score !== null && r.perf_score < 50) return "warning";
  return "ok";
}

export function getChecks(url, limit = 50) {
  const data = load();
  const key = urlKey(url);
  const arr = (data.checks || {})[key] || [];
  return arr.slice(0, limit);
}

export function getMonitorStats() {
  const data = load();
  const urls = data.urls || [];
  const checks = data.checks || {};
  const stats = {
    total_urls: urls.length,
    active_urls: urls.filter(u => u.active).length,
    by_source: {},
    by_project: {},
    last_24h: { ok: 0, warning: 0, critical: 0 },
  };
  for (const u of urls) {
    stats.by_source[u.source] = (stats.by_source[u.source] || 0) + 1;
    stats.by_project[u.project_id] = (stats.by_project[u.project_id] || 0) + 1;
  }
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const arr of Object.values(checks)) {
    for (const c of arr) {
      if (new Date(c.ts).getTime() < cutoff) break;
      stats.last_24h[c.severity] = (stats.last_24h[c.severity] || 0) + 1;
    }
  }
  return stats;
}

export const MONITOR_CONSTANTS = { VALID_SOURCES };
