/**
 * Requests Store — solicitudes/ajustes de clientes externos + equipo interno.
 * Pueden venir a través de compañeros, clientes directos, etc.
 *
 * Storage: projects-data/requests.json (ephemeral en Cloud Run; en futuro Firestore).
 *
 * Esquema de una solicitud:
 *   id              — uuid corto generado al crear
 *   created_at      — ISO timestamp
 *   updated_at      — ISO timestamp
 *   client_name     — quién pide (obligatorio) — puede ser cliente externo o compañero
 *   client_contact  — cómo contactar (email, Google Chat, teléfono, etc.) — opcional
 *   referred_by     — quién pasó la solicitud (si viene de compañero) — opcional
 *   target_url      — URL/ubicación donde van los cambios (ej: puyehue.cl, TAC, etc.) — opcional
 *   project_id      — id del proyecto en el repo (o "cliente-externo", "general")
 *   type            — "ajuste" | "error" | "idea" | "bloqueo" | "urgente" | "otro"
 *   priority        — "baja" | "media" | "alta" | "critica"
 *   title           — resumen corto (1 línea)
 *   message         — detalle completo
 *   status          — "nuevo" | "revisando" | "en_progreso" | "resuelto" | "descartado"
 *   assigned_to     — email (default "luis@retarget.cl")
 *   work_log        — array de eventos { at, type, detail } para audit trail
 *                     type: "status_changed" | "started" | "commit" | "completed" | "note"
 *   notes           — array de comentarios { at, by, text }
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "projects-data");
const FILE = join(DATA_DIR, "requests.json");

const VALID_TYPES = ["ajuste", "error", "idea", "bloqueo", "urgente", "otro"];
const VALID_PRIORITIES = ["baja", "media", "alta", "critica"];
const VALID_STATUSES = ["nuevo", "revisando", "en_progreso", "resuelto", "descartado"];

function ensureDir() {
  try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

function load() {
  ensureDir();
  if (!existsSync(FILE)) return { requests: [] };
  try { return JSON.parse(readFileSync(FILE, "utf8")); } catch { return { requests: [] }; }
}

function save(data) {
  ensureDir();
  try {
    writeFileSync(FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`[requests-store] save failed: ${err.message}`);
  }
}

function shortId() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
}

/**
 * Crea una nueva solicitud.
 * Campos requeridos: client_name, title, message.
 * El resto tiene default razonable.
 */
export function addRequest(payload) {
  if (!payload || typeof payload !== "object") throw new Error("payload requerido");
  if (!payload.client_name || typeof payload.client_name !== "string") throw new Error("client_name es obligatorio");
  if (!payload.title || typeof payload.title !== "string") throw new Error("title es obligatorio");
  if (!payload.message || typeof payload.message !== "string") throw new Error("message es obligatorio");

  const type = VALID_TYPES.includes(payload.type) ? payload.type : "ajuste";
  const priority = VALID_PRIORITIES.includes(payload.priority) ? payload.priority : "media";

  const data = load();
  const now = new Date().toISOString();
  const req = {
    id: shortId(),
    created_at: now,
    updated_at: now,
    client_name: payload.client_name.slice(0, 120).trim(),
    client_email: (payload.client_email || "").slice(0, 200).trim(),
    project_id: (payload.project_id || "general").slice(0, 80).trim(),
    type,
    priority,
    title: payload.title.slice(0, 200).trim(),
    message: payload.message.slice(0, 4000).trim(),
    status: "nuevo",
    assigned_to: payload.assigned_to || "luis@retarget.cl",
    notes: [],
  };
  data.requests.push(req);
  save(data);
  return req;
}

/**
 * Lista solicitudes, opcionalmente filtradas por proyecto y/o status.
 * Las más recientes primero.
 */
export function listRequests(filter = {}) {
  const data = load();
  let items = data.requests || [];
  if (filter.project_id) items = items.filter(r => r.project_id === filter.project_id);
  if (filter.status) items = items.filter(r => r.status === filter.status);
  if (filter.type) items = items.filter(r => r.type === filter.type);
  // ordenar: críticas/urgentes primero, luego por fecha desc
  const priorityWeight = { critica: 0, alta: 1, media: 2, baja: 3 };
  items = items.slice().sort((a, b) => {
    const pa = priorityWeight[a.priority] ?? 9;
    const pb = priorityWeight[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return new Date(b.created_at) - new Date(a.created_at);
  });
  return items;
}

export function getRequest(id) {
  const data = load();
  return (data.requests || []).find(r => r.id === id) || null;
}

/**
 * Actualiza el status (y opcionalmente otros campos) de una solicitud.
 * Solo permite cambios a campos seguros.
 */
export function updateRequest(id, changes = {}) {
  const data = load();
  const idx = (data.requests || []).findIndex(r => r.id === id);
  if (idx === -1) throw new Error(`solicitud ${id} no encontrada`);
  const r = data.requests[idx];

  if (changes.status !== undefined) {
    if (!VALID_STATUSES.includes(changes.status)) throw new Error(`status inválido: ${changes.status}`);
    r.status = changes.status;
  }
  if (changes.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(changes.priority)) throw new Error(`priority inválida: ${changes.priority}`);
    r.priority = changes.priority;
  }
  if (changes.assigned_to !== undefined) {
    r.assigned_to = String(changes.assigned_to).slice(0, 200);
  }
  if (changes.note !== undefined && changes.note) {
    r.notes.push({
      at: new Date().toISOString(),
      by: changes.note_by || "anónimo",
      text: String(changes.note).slice(0, 2000),
    });
  }
  r.updated_at = new Date().toISOString();
  data.requests[idx] = r;
  save(data);
  return r;
}

/**
 * Stats agregadas para el dashboard: total, por status, por prioridad, por proyecto.
 */
export function getRequestsStats() {
  const items = listRequests();
  const byStatus = {};
  const byPriority = {};
  const byProject = {};
  const byType = {};
  for (const r of items) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    byProject[r.project_id] = (byProject[r.project_id] || 0) + 1;
    byType[r.type] = (byType[r.type] || 0) + 1;
  }
  return {
    total: items.length,
    open: items.filter(r => r.status !== "resuelto" && r.status !== "descartado").length,
    by_status: byStatus,
    by_priority: byPriority,
    by_project: byProject,
    by_type: byType,
  };
}

export const REQUEST_CONSTANTS = { VALID_TYPES, VALID_PRIORITIES, VALID_STATUSES };
