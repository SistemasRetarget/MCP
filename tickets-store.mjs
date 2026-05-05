/**
 * Tickets Store — requerimientos que llegan por correo a Sistemas Retarget.
 *
 * Flujo:
 *   intake (Gmail/manual) → analyzing → pending_validation → in_execution
 *   → drafted (correo borrador en Gmail) → sent → closed
 *
 * Cada ticket conserva el asunto original (lenguaje del solicitante) Y un
 * ID Retarget interno (RT-{PROYECTO}-{YYYY}{NN}) que respalda nuestra primera
 * respuesta para trazabilidad.
 *
 * Storage: projects-data/tickets.json (ephemeral en Cloud Run; futuro Firestore).
 *
 * Esquema:
 *   id_retarget       — "RT-PYH-202611" (visible en respuesta y PDF)
 *   subject_original  — asunto exacto del correo recibido
 *   gmail_thread_id   — id del hilo en Gmail (null si entrada manual)
 *   project_id        — proyecto detectado o asignado (puyehue-cl, puebloladehesa-web, etc.)
 *   from              — { name, email }
 *   received_at       — ISO timestamp del correo original
 *   body_plain        — cuerpo del correo (texto)
 *   attachments       — array de { name, url|path, mime }
 *   status            — "intake" | "analyzing" | "pending_validation"
 *                     | "in_execution" | "drafted" | "sent" | "closed" | "rejected"
 *   priority          — "baja" | "media" | "alta" | "critica"
 *   target_env        — "qa" | "prod"  (si toca prod, alerta naranja)
 *   summary_ai        — resumen LLM en bullets
 *   risks_ai          — riesgos detectados por LLM (lista)
 *   validated_by      — { user, at } cuando Leig/Mauricio aprueban
 *   execution_log     — array de { at, by, action, detail }
 *   pdf_url           — link al PDF de ejecución generado
 *   draft_id          — id del draft en Gmail
 *   sent_at           — ISO cuando se envió la respuesta
 *   notes             — array de { at, by, text } comentarios internos
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "projects-data");
const FILE = join(DATA_DIR, "tickets.json");
const COUNTERS_FILE = join(DATA_DIR, "tickets-counters.json");

const VALID_STATUSES = [
  "intake", "analyzing", "pending_validation", "in_execution",
  "drafted", "sent", "closed", "rejected",
];
const VALID_PRIORITIES = ["baja", "media", "alta", "critica"];
const VALID_ENVS = ["qa", "prod"];

// Mapeo proyecto → prefijo en el ID Retarget
const PROJECT_PREFIX = {
  "puyehue-cl": "PYH",
  "puebloladehesa-web": "PLD",
  "cms-retarget": "CMS",
  "cms-retarget-universal": "CMU",
  "MCP": "MCP",
  "general": "RT",
};

function ensureDir() {
  try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function load() {
  ensureDir();
  if (!existsSync(FILE)) return { tickets: [] };
  try { return JSON.parse(readFileSync(FILE, "utf8")); } catch { return { tickets: [] }; }
}

function save(data) {
  ensureDir();
  try { writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8"); }
  catch (err) { console.error(`[tickets-store] save failed: ${err.message}`); }
}

function loadCounters() {
  ensureDir();
  if (!existsSync(COUNTERS_FILE)) return {};
  try { return JSON.parse(readFileSync(COUNTERS_FILE, "utf8")); } catch { return {}; }
}

function saveCounters(c) {
  ensureDir();
  try { writeFileSync(COUNTERS_FILE, JSON.stringify(c, null, 2), "utf8"); }
  catch (err) { console.error(`[tickets-store] counters save failed: ${err.message}`); }
}

/**
 * Genera el siguiente ID Retarget para un proyecto.
 * Formato: RT-{PROY}-{YYYY}{NN} donde NN es correlativo de 2 dígitos por año/proyecto.
 * Ej: RT-PYH-202601, RT-PYH-202602, ...
 */
export function nextRetargetId(projectId = "general") {
  const prefix = PROJECT_PREFIX[projectId] || "RT";
  const year = new Date().getFullYear();
  const counters = loadCounters();
  const key = `${prefix}-${year}`;
  counters[key] = (counters[key] || 0) + 1;
  saveCounters(counters);
  const seq = String(counters[key]).padStart(2, "0");
  return `RT-${prefix}-${year}${seq}`;
}

/**
 * Crea un ticket. Si no se pasa id_retarget, se genera uno.
 * Campos requeridos: subject_original, from.email, body_plain.
 */
export function addTicket(payload) {
  if (!payload || typeof payload !== "object") throw new Error("payload requerido");
  if (!payload.subject_original) throw new Error("subject_original requerido");
  if (!payload.from || !payload.from.email) throw new Error("from.email requerido");
  if (!payload.body_plain) throw new Error("body_plain requerido");

  const data = load();
  const project_id = (payload.project_id || "general").trim();
  const id_retarget = payload.id_retarget || nextRetargetId(project_id);
  const now = new Date().toISOString();

  const ticket = {
    id_retarget,
    subject_original: String(payload.subject_original).slice(0, 500).trim(),
    gmail_thread_id: payload.gmail_thread_id || null,
    gmail_message_id: payload.gmail_message_id || null,
    project_id,
    from: {
      name: String(payload.from.name || "").slice(0, 200),
      email: String(payload.from.email).slice(0, 200),
    },
    received_at: payload.received_at || now,
    created_at: now,
    updated_at: now,
    body_plain: String(payload.body_plain).slice(0, 20000),
    attachments: Array.isArray(payload.attachments) ? payload.attachments.slice(0, 20) : [],
    status: "intake",
    priority: VALID_PRIORITIES.includes(payload.priority) ? payload.priority : "media",
    target_env: VALID_ENVS.includes(payload.target_env) ? payload.target_env : "qa",
    summary_ai: null,
    risks_ai: null,
    validated_by: null,
    execution_log: [],
    pdf_url: null,
    draft_id: null,
    sent_at: null,
    notes: [],
  };
  data.tickets.push(ticket);
  save(data);
  return ticket;
}

export function listTickets(filter = {}) {
  const data = load();
  let items = data.tickets || [];
  if (filter.project_id) items = items.filter(t => t.project_id === filter.project_id);
  if (filter.status) items = items.filter(t => t.status === filter.status);
  if (filter.target_env) items = items.filter(t => t.target_env === filter.target_env);
  // pendientes primero (estados abiertos), luego por fecha desc
  const openStatuses = new Set(["intake", "analyzing", "pending_validation", "in_execution", "drafted"]);
  items = items.slice().sort((a, b) => {
    const ao = openStatuses.has(a.status) ? 0 : 1;
    const bo = openStatuses.has(b.status) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return new Date(b.received_at) - new Date(a.received_at);
  });
  return items;
}

export function getTicket(idRetarget) {
  const data = load();
  return (data.tickets || []).find(t => t.id_retarget === idRetarget) || null;
}

/**
 * Actualiza un ticket. Solo permite mutaciones controladas.
 * Acciones soportadas en `changes`:
 *   - status (string) — debe estar en VALID_STATUSES
 *   - priority (string)
 *   - target_env (string)
 *   - project_id (string)
 *   - summary_ai (string|object)
 *   - risks_ai (array)
 *   - validate ({ user }) — marca validated_by
 *   - log_execution ({ by, action, detail })
 *   - pdf_url (string)
 *   - draft_id (string)
 *   - mark_sent (true) — graba sent_at
 *   - note ({ by, text })
 */
export function updateTicket(idRetarget, changes = {}) {
  const data = load();
  const idx = (data.tickets || []).findIndex(t => t.id_retarget === idRetarget);
  if (idx === -1) throw new Error(`ticket ${idRetarget} no encontrado`);
  const t = data.tickets[idx];
  const now = new Date().toISOString();

  if (changes.status !== undefined) {
    if (!VALID_STATUSES.includes(changes.status)) throw new Error(`status inválido: ${changes.status}`);
    t.status = changes.status;
  }
  if (changes.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(changes.priority)) throw new Error(`priority inválida: ${changes.priority}`);
    t.priority = changes.priority;
  }
  if (changes.target_env !== undefined) {
    if (!VALID_ENVS.includes(changes.target_env)) throw new Error(`target_env inválido: ${changes.target_env}`);
    t.target_env = changes.target_env;
  }
  if (changes.project_id !== undefined) t.project_id = String(changes.project_id).slice(0, 80);
  if (changes.summary_ai !== undefined) t.summary_ai = changes.summary_ai;
  if (changes.risks_ai !== undefined) t.risks_ai = changes.risks_ai;
  if (changes.validate) {
    t.validated_by = { user: String(changes.validate.user || "").slice(0, 200), at: now };
    if (t.status === "pending_validation") t.status = "in_execution";
  }
  if (changes.log_execution) {
    t.execution_log.push({
      at: now,
      by: String(changes.log_execution.by || "").slice(0, 120),
      action: String(changes.log_execution.action || "").slice(0, 120),
      detail: String(changes.log_execution.detail || "").slice(0, 2000),
    });
  }
  if (changes.pdf_url !== undefined) t.pdf_url = String(changes.pdf_url).slice(0, 1000);
  if (changes.draft_id !== undefined) t.draft_id = String(changes.draft_id).slice(0, 200);
  if (changes.mark_sent) {
    t.sent_at = now;
    t.status = "sent";
  }
  if (changes.note) {
    t.notes.push({
      at: now,
      by: String(changes.note.by || "anónimo").slice(0, 120),
      text: String(changes.note.text || "").slice(0, 2000),
    });
  }
  t.updated_at = now;
  data.tickets[idx] = t;
  save(data);
  return t;
}

export function getTicketsStats() {
  const items = listTickets();
  const byStatus = {};
  const byProject = {};
  const byEnv = {};
  for (const t of items) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byProject[t.project_id] = (byProject[t.project_id] || 0) + 1;
    byEnv[t.target_env] = (byEnv[t.target_env] || 0) + 1;
  }
  return {
    total: items.length,
    open: items.filter(t => !["sent", "closed", "rejected"].includes(t.status)).length,
    awaiting_validation: items.filter(t => t.status === "pending_validation").length,
    by_status: byStatus,
    by_project: byProject,
    by_env: byEnv,
  };
}

export const TICKET_CONSTANTS = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  VALID_ENVS,
  PROJECT_PREFIX,
};
