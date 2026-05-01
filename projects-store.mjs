/**
 * Projects Store — vive en el SERVIDOR MCP. Es genérico para cualquier
 * proyecto registrado en /app/projects/<id>-config.json.
 *
 * Gestiona por cada proyecto:
 *   - feedback   (recibido desde la UI)
 *   - errors     (logs de errores reportados al MCP)
 *   - reasoning  (razonamiento/decisiones de cada fase)
 *   - deploy     (último commit, versión, build status)
 *
 * Persistencia: best-effort en /app/projects-data/<id>.json
 * Cloud Run filesystem es ephemeral entre revisiones — al redeployear
 * se pierde. Para producción real conviene mover a GCS/Firestore.
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "projects-data");
const PROJECTS_DIR = join(__dirname, "mcp-projects");

const MAX_ITEMS = 200;
const memCache = new Map();

function ensureDir() {
  try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function loadFromDisk(id) {
  ensureDir();
  const file = join(DATA_DIR, `${id}.json`);
  if (!existsSync(file)) return null;
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
}

function saveToDisk(id, data) {
  ensureDir();
  try {
    writeFileSync(join(DATA_DIR, `${id}.json`), JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`[projects-store] save failed for ${id}: ${err.message}`);
  }
}

function defaults() {
  return { feedback: [], errors: [], reasoning: [], deploy: null };
}

export function getProjectData(id) {
  if (memCache.has(id)) return memCache.get(id);
  const data = loadFromDisk(id) || defaults();
  memCache.set(id, data);
  return data;
}

function pushItem(id, key, item) {
  const d = getProjectData(id);
  d[key] = d[key] || [];
  d[key].push({ at: new Date().toISOString(), ...item });
  if (d[key].length > MAX_ITEMS) d[key] = d[key].slice(-MAX_ITEMS);
  saveToDisk(id, d);
  return d[key][d[key].length - 1];
}

export function addFeedback(id, { author, email, message, kind = "general", rating }) {
  if (!message || !String(message).trim()) throw new Error("message requerido");
  return pushItem(id, "feedback", {
    author: author || "anónimo",
    email: email || null,
    message: String(message).slice(0, 4000),
    kind,
    rating: typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : null,
  });
}

export function addError(id, { source = "unknown", message, stack, level = "error", url }) {
  if (!message) throw new Error("message requerido");
  return pushItem(id, "errors", {
    source,
    level,
    message: String(message).slice(0, 4000),
    stack: stack ? String(stack).slice(0, 8000) : null,
    url: url || null,
  });
}

export function addReasoning(id, { phase, decision, rationale, alternatives = [] }) {
  if (!decision) throw new Error("decision requerida");
  return pushItem(id, "reasoning", {
    phase: phase || "general",
    decision: String(decision).slice(0, 2000),
    rationale: rationale ? String(rationale).slice(0, 4000) : null,
    alternatives: Array.isArray(alternatives) ? alternatives.slice(0, 10) : [],
  });
}

/**
 * Anotación de revisión sobre una decisión específica del AI.
 * El revisor puede marcar "este razonamiento estuvo mal porque X".
 */
export function addAnnotation(id, payload) {
  if (!payload.target) throw new Error("target requerido (landing|reasoning|section)");
  if (!payload.what_went_wrong) throw new Error("what_went_wrong requerido");
  return pushItem(id, "annotations", {
    target: payload.target,                          // ej: "landing:home/header" | "reasoning:<idx>"
    target_id: payload.target_id || null,
    what_went_wrong: String(payload.what_went_wrong).slice(0, 2000),
    suggested_fix: payload.suggested_fix ? String(payload.suggested_fix).slice(0, 2000) : null,
    severity: ["low","medium","high","critical"].includes(payload.severity) ? payload.severity : "medium",
    reviewer: payload.reviewer || "anónimo",
    reviewer_email: payload.reviewer_email || null,
  });
}

/**
 * Score reverso — el humano califica al AI por landing (0-100).
 * Se promedia con el histórico (lectura justa del trabajo del AI).
 */
export function setReviewScore(id, landingId, payload) {
  if (!landingId) throw new Error("landingId requerido");
  if (typeof payload.score !== "number" || payload.score < 0 || payload.score > 100) {
    throw new Error("score requerido (0-100)");
  }
  const d = getProjectData(id);
  d.review_scores = d.review_scores || {};
  d.review_scores[landingId] = d.review_scores[landingId] || { history: [] };
  const entry = {
    at: new Date().toISOString(),
    score: payload.score,
    reviewer: payload.reviewer || "anónimo",
    reviewer_email: payload.reviewer_email || null,
    notes: payload.notes ? String(payload.notes).slice(0, 1000) : null,
  };
  d.review_scores[landingId].history.push(entry);
  if (d.review_scores[landingId].history.length > 50) {
    d.review_scores[landingId].history = d.review_scores[landingId].history.slice(-50);
  }
  // Promedio actualizado
  const hist = d.review_scores[landingId].history;
  d.review_scores[landingId].average = Math.round(hist.reduce((s, h) => s + h.score, 0) / hist.length);
  d.review_scores[landingId].count = hist.length;
  saveToDisk(id, d);
  return d.review_scores[landingId];
}

export function setLandingScreenshot(id, landingId, payload) {
  if (!landingId) throw new Error("landingId requerido");
  const d = getProjectData(id);
  d.landings_state = d.landings_state || {};
  d.landings_state[landingId] = d.landings_state[landingId] || {};
  const kind = payload.kind || "actual"; // reference | actual | diff
  d.landings_state[landingId][`${kind}_url`] = payload.url || null;
  d.landings_state[landingId].captured_at = new Date().toISOString();
  if (payload.notes) d.landings_state[landingId].notes = String(payload.notes).slice(0, 1000);
  saveToDisk(id, d);
  return d.landings_state[landingId];
}

export async function setLandingPageSpeed(id, landingId, payload) {
  if (!landingId) throw new Error("landingId requerido");
  const d = getProjectData(id);
  d.landings_state = d.landings_state || {};
  d.landings_state[landingId] = d.landings_state[landingId] || {};
  
  // Si se proporciona URL, ejecutar prueba automática de Page Speed
  if (payload.url) {
    try {
      const { validateCoreWebVitals } = await import("./validators/core-web-vitals.mjs");
      const apiKey = process.env.PAGESPEED_API_KEY || null;
      const result = await validateCoreWebVitals(payload.url, apiKey);
      
      d.landings_state[landingId].pagespeed_result = result;
      d.landings_state[landingId].pagespeed_url = payload.url;
      d.landings_state[landingId].pagespeed_at = new Date().toISOString();
      
      // Generar notas automáticamente del resultado
      const notes = [
        `Performance Score: ${result.overall_score}/100`,
        `Status: ${result.passed ? '✅ PASS' : '❌ FAIL'}`,
        result.metrics?.performance_score ? `Lighthouse Performance: ${Math.round(result.metrics.performance_score)}/100` : '',
        result.issues?.length ? `Issues: ${result.issues.join(', ')}` : 'No critical issues'
      ].filter(Boolean).join('\n');
      
      d.landings_state[landingId].pagespeed_notes = notes;
    } catch (err) {
      d.landings_state[landingId].pagespeed_notes = `Error al ejecutar Page Speed: ${err.message}`;
      d.landings_state[landingId].pagespeed_error = err.message;
    }
  } else if (payload.notes) {
    // Fallback a notas manuales
    d.landings_state[landingId].pagespeed_notes = String(payload.notes || "").slice(0, 10000);
    d.landings_state[landingId].pagespeed_at = new Date().toISOString();
  }
  
  saveToDisk(id, d);
  return d.landings_state[landingId];
}

export async function captureLandingScreenshot(id, landingId, payload) {
  if (!landingId) throw new Error("landingId requerido");
  const d = getProjectData(id);
  d.landings_state = d.landings_state || {};
  d.landings_state[landingId] = d.landings_state[landingId] || {};
  
  const kind = payload.kind || "actual"; // reference | actual | diff
  const url = payload.url;
  
  if (!url) throw new Error("URL requerida para captura");
  
  try {
    // Intentar usar playwright para capturar screenshot
    const { exec } = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");
    
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filename = `${landingId}-${kind}-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);
    
    // Usar npx playwright para capturar screenshot
    const cmd = `npx playwright screenshot "${url}" -o "${filePath}" --wait-for-selector="body" --timeout=10000`;
    await new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve(stdout);
      });
    });
    
    // Guardar la URL del screenshot
    d.landings_state[landingId][`${kind}_url`] = `/uploads/${filename}`;
    d.landings_state[landingId].captured_at = new Date().toISOString();
    
    saveToDisk(id, d);
    return d.landings_state[landingId];
  } catch (err) {
    // Si playwright falla, guardar la URL como referencia
    d.landings_state[landingId][`${kind}_url`] = url;
    d.landings_state[landingId].captured_at = new Date().toISOString();
    d.landings_state[landingId][`${kind}_error`] = err.message;
    saveToDisk(id, d);
    return d.landings_state[landingId];
  }
}

export function updateLandingProgress(id, landingId, payload) {
  if (!landingId) throw new Error("landingId requerido");
  const d = getProjectData(id);
  d.landings_state = d.landings_state || {};
  d.landings_state[landingId] = d.landings_state[landingId] || {};
  if (typeof payload.progress === "number") d.landings_state[landingId].progress = Math.max(0, Math.min(100, payload.progress));
  if (payload.status) d.landings_state[landingId].status = payload.status;
  if (payload.reasoning) d.landings_state[landingId].reasoning = String(payload.reasoning).slice(0, 4000);
  if (payload.header_status) d.landings_state[landingId].header_status = payload.header_status;
  if (payload.footer_status) d.landings_state[landingId].footer_status = payload.footer_status;
  d.landings_state[landingId].updated_at = new Date().toISOString();
  saveToDisk(id, d);
  return d.landings_state[landingId];
}

export function setDeploy(id, deployInfo) {
  const d = getProjectData(id);
  d.deploy = {
    at: new Date().toISOString(),
    last_commit: deployInfo.last_commit || null,
    last_deploy_at: deployInfo.last_deploy_at || new Date().toISOString(),
    status: deployInfo.status || "unknown",
    build_id: deployInfo.build_id || null,
    version: deployInfo.version || null,
    url: deployInfo.url || null,
    revision: deployInfo.revision || null,
  };
  saveToDisk(id, d);
  return d.deploy;
}

/**
 * Permite al usuario archivar/reactivar un proyecto sin tocar el config del repo.
 * Persiste en projects-data/<id>.json como status_override.
 * Status válidos: "active", "archived", "paused".
 */
export function setProjectStatus(id, status) {
  const valid = ["active", "archived", "paused"];
  if (!valid.includes(status)) throw new Error(`status inválido: ${status}. Usa uno de ${valid.join(", ")}`);
  const d = getProjectData(id);
  d.status_override = status;
  d.status_changed_at = new Date().toISOString();
  saveToDisk(id, d);
  return { id, status, status_changed_at: d.status_changed_at };
}

export function listProjects(filter = {}) {
  try {
    const files = readdirSync(PROJECTS_DIR).filter(f => f.endsWith("-config.json"));
    let projects = files.map(f => {
      const cfg = JSON.parse(readFileSync(join(PROJECTS_DIR, f), "utf8"));
      const id = cfg.project_id || cfg.id || f.replace("-config.json", "");
      const data = getProjectData(id);
      const effectiveStatus = data.status_override || cfg.status || "active";
      return {
        id,
        name: cfg.project_name || id,
        description: cfg.description || "",
        status: effectiveStatus,
        config_status: cfg.status || "active",
        status_override: data.status_override || null,
        status_changed_at: data.status_changed_at || null,
        progress: cfg.replication?.progress_percent ?? 0,
        current_step: cfg.workflow?.current_step || cfg.replication?.phase || "—",
        repositories: cfg.repositories || {},
        deployment: data.deploy || cfg.deployment || null,
        counts: {
          feedback: data.feedback.length,
          errors: data.errors.length,
          reasoning: data.reasoning.length,
        },
        last_error: data.errors[data.errors.length - 1] || null,
        last_feedback: data.feedback[data.feedback.length - 1] || null,
      };
    });
    if (filter.status) {
      projects = projects.filter(p => p.status === filter.status);
    }
    if (filter.exclude_status) {
      projects = projects.filter(p => p.status !== filter.exclude_status);
    }
    return projects;
  } catch (err) {
    console.error(`[projects-store] listProjects: ${err.message}`);
    return [];
  }
}

/**
 * Crea un proyecto rápido (lightweight) para cambios simples como banners.
 * No crea repo GitHub, solo config local.
 */
export function quickCreateProject(name, description = "") {
  const id = name.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "");
  if (!id || id.length < 2) throw new Error("Nombre de proyecto inválido");
  
  const configPath = join(PROJECTS_DIR, `${id}-config.json`);
  if (existsSync(configPath)) throw new Error(`El proyecto "${id}" ya existe`);
  
  const now = new Date().toISOString();
  const cfg = {
    project_id: id,
    project_name: name,
    description: description || `Proyecto rápido: ${name}`,
    status: "active",
    created_at: now,
    quick_project: true,
    repositories: {
      source: { url: "", type: "local", description: "Proyecto rápido - sin repo GitHub" },
      qa: { url: "", type: "local", description: "Por definir" },
      production: { url: "", type: "local", description: "Por definir" }
    },
    reconnaissance: { status: "completed" },
    replication: { 
      status: "in_progress", 
      progress_percent: 10,
      completed_sections: [],
      pending_sections: ["assets", "content"]
    },
    workflow: { current_step: "scoping", steps: [] },
    deployment: { status: "not_deployed" },
    landings: [],
    resources: { notes: "Creado desde módulo de solicitudes" },
    team: [],
    branding: {}
  };
  
  try {
    writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf8");
    return { project_id: id, created: true, path: configPath };
  } catch (err) {
    throw new Error(`No se pudo crear el proyecto: ${err.message}`);
  }
}

/**
 * Agrega una observación a una landing específica del proyecto.
 */
export function addLandingObservation(id, landingId, payload) {
  const d = getProjectData(id);
  d.landings_observations = d.landings_observations || {};
  d.landings_observations[landingId] = d.landings_observations[landingId] || [];
  const obs = {
    at: new Date().toISOString(),
    by: payload.by || "anónimo",
    text: String(payload.text || "").slice(0, 1000),
  };
  d.landings_observations[landingId].push(obs);
  saveToDisk(id, d);
  return obs;
}

export function getProjectFull(id) {
  try {
    // 1) Intentar archivo directo: <id>-config.json
    let cfg = null;
    const directFile = join(PROJECTS_DIR, `${id}-config.json`);
    if (existsSync(directFile)) {
      cfg = JSON.parse(readFileSync(directFile, "utf8"));
    } else {
      // 2) Buscar por project_id en cualquier *-config.json
      const files = readdirSync(PROJECTS_DIR).filter(f => f.endsWith("-config.json"));
      for (const f of files) {
        const c = JSON.parse(readFileSync(join(PROJECTS_DIR, f), "utf8"));
        if (c.project_id === id || c.id === id) { cfg = c; break; }
      }
    }
    if (!cfg) return null;
    const data = getProjectData(id);
    // Mergear landings con su estado runtime (screenshots, progreso, observaciones)
    const landings = (cfg.landings || []).map((l) => {
      const state = data.landings_state?.[l.id] || {};
      return {
        ...l,
        progress: state.progress ?? l.progress,
        status: state.status || l.status,
        reasoning: state.reasoning || l.reasoning,
        header: { ...l.header, status: state.header_status || l.header?.status },
        footer: { ...l.footer, status: state.footer_status || l.footer?.status },
        screenshots: {
          ...l.screenshots,
          reference_url: state.reference_url || l.screenshots?.reference_url || null,
          actual_url: state.actual_url || l.screenshots?.actual_url || null,
          diff_url: state.diff_url || l.screenshots?.diff_url || null,
          captured_at: state.captured_at || l.screenshots?.captured_at || null,
          notes: state.notes || l.screenshots?.notes || null,
        },
        pagespeed_notes: state.pagespeed_notes || l.pagespeed_notes || null,
        pagespeed_at: state.pagespeed_at || l.pagespeed_at || null,
        pagespeed_url: state.pagespeed_url || l.pagespeed_url || null,
        pagespeed_result: state.pagespeed_result || l.pagespeed_result || null,
        pagespeed_error: state.pagespeed_error || l.pagespeed_error || null,
        observations: data.landings_observations?.[l.id] || [],
        updated_at: state.updated_at || null,
      };
    });
    return {
      ...cfg,
      landings,
      runtime: {
        feedback: data.feedback.slice(-50).reverse(),
        errors: data.errors.slice(-50).reverse(),
        reasoning: data.reasoning.slice(-50).reverse(),
        annotations: (data.annotations || []).slice(-100).reverse(),
        review_scores: data.review_scores || {},
        deploy: data.deploy || cfg.deployment || null,
      },
    };
  } catch (err) {
    return null;
  }
}
