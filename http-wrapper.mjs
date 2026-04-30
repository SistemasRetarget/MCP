/**
 * HTTP wrapper for the quality-gate MCP server.
 * Exposes the stdio JSON-RPC MCP protocol as a REST HTTP API
 * so it can run on Google Cloud Run.
 *
 * POST /mcp  → body: MCP JSON-RPC message → response: MCP JSON-RPC response
 * GET  /     → health check
 * GET  /status → server info + uptime
 */

import { createServer } from "http";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync as existsSyncCompat } from "fs";
import { validateCoreWebVitals } from "./validators/core-web-vitals.mjs";
import { validateGoogleAdsPolicies } from "./validators/google-ads-policies.mjs";
import { validateSEOTechnical } from "./validators/seo-technical.mjs";
import { validateMobileFirst } from "./validators/mobile-first.mjs";
import { chatLoop, TOOLS as CHAT_TOOLS } from "./chat.mjs";
import { getHealthSnapshot, getEvents, logEvent, recordChatOutcome } from "./health-monitor.mjs";
import {
  listProjects,
  getProjectFull,
  addFeedback,
  addError,
  addReasoning,
  setDeploy,
  setLandingScreenshot,
  updateLandingProgress,
  addAnnotation,
  setReviewScore,
  setProjectStatus,
  quickCreateProject,
  addLandingObservation,
} from "./projects-store.mjs";
import { runAllTests } from "./tests/run-tests.mjs";
import { gradePrompt, codeBasedGrade } from "./prompt-eval/grader.mjs";
import {
  addRequest,
  listRequests,
  getRequest,
  updateRequest,
  getRequestsStats,
  REQUEST_CONSTANTS,
} from "./requests-store.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || "8080", 10);
const MCP_BIN = join(__dirname, "servers/quality-gate/target/release/quality-gate-server");
const STARTED_AT = new Date().toISOString();

// Spawn MCP process (persistent, reused across requests)
let mcpProcess = null;
let pendingRequests = new Map(); // id → { resolve, reject, timer }
let buffer = "";

// Tracking del estado del binario Rust para degradación graceful.
// Si el binario falla, el wrapper HTTP sigue vivo pero marca mcp_process_alive=false.
let mcpStartFailures = 0;
const MAX_START_FAILURES = 5; // tras 5 fallos consecutivos, dejamos de reintentar

function startMcpProcess() {
  try {
    if (!existsSyncCompat(MCP_BIN)) {
      console.error(`[wrapper] MCP binary not found at ${MCP_BIN} — running in degraded mode (HTTP only, no rust MCP).`);
      mcpProcess = null;
      return;
    }
  } catch {}

  try {
    mcpProcess = spawn(MCP_BIN, [], {
      env: {
        ...process.env,
        WORKSPACE_MCP_HOME: process.env.WORKSPACE_MCP_HOME || __dirname,
        RETARGET_WORKSPACE: process.env.RETARGET_WORKSPACE || join(__dirname, "contracts"),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (err) {
    console.error(`[wrapper] spawn failed: ${err.message} — degraded mode.`);
    mcpProcess = null;
    mcpStartFailures++;
    return;
  }

  // CRÍTICO: capturar 'error' event para que NO crashee el proceso Node
  mcpProcess.on("error", (err) => {
    console.error(`[wrapper] MCP process error: ${err.code || err.message} — degraded mode.`);
    mcpStartFailures++;
    mcpProcess = null;
    pendingRequests.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error("MCP process error: " + err.message));
    });
    pendingRequests.clear();
    if (mcpStartFailures < MAX_START_FAILURES) {
      setTimeout(startMcpProcess, 2000);
    } else {
      console.error(`[wrapper] giving up rust MCP after ${MAX_START_FAILURES} failures. HTTP wrapper continues.`);
    }
  });

  mcpProcess.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        const id = msg.id;
        if (id !== undefined && pendingRequests.has(id)) {
          const { resolve, timer } = pendingRequests.get(id);
          clearTimeout(timer);
          pendingRequests.delete(id);
          resolve(msg);
        }
      } catch (_) {}
    }
  });

  mcpProcess.stderr.on("data", (d) => {
    process.stderr.write("[mcp-stderr] " + d.toString());
  });

  mcpProcess.on("exit", (code) => {
    console.error(`[wrapper] MCP process exited with code ${code}.`);
    mcpStartFailures++;
    mcpProcess = null;
    pendingRequests.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error("MCP process died"));
    });
    pendingRequests.clear();
    if (mcpStartFailures < MAX_START_FAILURES) {
      console.error(`[wrapper] restarting in 2s (failure ${mcpStartFailures}/${MAX_START_FAILURES})`);
      setTimeout(startMcpProcess, 2000);
    } else {
      console.error(`[wrapper] giving up rust MCP after ${MAX_START_FAILURES} failures. HTTP wrapper continues in degraded mode.`);
    }
  });

  if (mcpProcess.pid) {
    mcpStartFailures = 0; // reset on successful spawn
    console.log("[wrapper] MCP process started, PID:", mcpProcess.pid);
  }
}

function sendToMcp(message) {
  return new Promise((resolve, reject) => {
    if (!mcpProcess || mcpProcess.exitCode !== null) {
      return reject(new Error("MCP process not running"));
    }
    const id = message.id ?? Math.random().toString(36).slice(2);
    const msg = { ...message, id };
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error("MCP request timeout (30s)"));
    }, 30000);
    pendingRequests.set(id, { resolve, reject, timer });
    mcpProcess.stdin.write(JSON.stringify(msg) + "\n");
  });
}

// HTTP Server
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", service: "quality-gate-mcp" }));
  }

  // Heartbeat — ultraligero, sin I/O, para que Cascade pueda hacer polling
  // y saber si el MCP esta vivo / si una nueva revision ya esta sirviendo.
  if (req.method === "GET" && url.pathname === "/heartbeat") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      alive: true,
      ts: Date.now(),
      started_at: STARTED_AT,
      uptime_seconds: Math.floor((Date.now() - new Date(STARTED_AT).getTime()) / 1000),
      pid: process.pid,
    }));
  }

  // ──────────── TESTS / PROMPT EVAL ────────────
  // GET /tests → vista HTML
  if (req.method === "GET" && (url.pathname === "/tests" || url.pathname === "/tests/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/tests.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }
  // GET /salud → vista HTML profesional de la salud del sistema (consume /health)
  if (req.method === "GET" && (url.pathname === "/salud" || url.pathname === "/salud/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/salud.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }
  // GET /eventos → vista HTML de eventos del sistema (consume /events)
  if (req.method === "GET" && (url.pathname === "/eventos" || url.pathname === "/eventos/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/eventos.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }
  // GET /equipo → vista HTML del equipo (consume /team)
  if (req.method === "GET" && (url.pathname === "/equipo" || url.pathname === "/equipo/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/equipo.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // GET /solicitudes → vista HTML del módulo de solicitudes
  if (req.method === "GET" && (url.pathname === "/solicitudes" || url.pathname === "/solicitudes/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/solicitudes.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // GET /api/requests → lista solicitudes (con filtros opcionales ?project=X&status=Y&type=Z)
  if (req.method === "GET" && url.pathname === "/api/requests") {
    try {
      const filter = {
        project_id: url.searchParams.get("project") || undefined,
        status: url.searchParams.get("status") || undefined,
        type: url.searchParams.get("type") || undefined,
      };
      const items = listRequests(filter);
      const stats = getRequestsStats();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ requests: items, stats, constants: REQUEST_CONSTANTS }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // POST /api/requests → crear nueva solicitud (sin auth: cualquiera puede pedir)
  if (req.method === "POST" && url.pathname === "/api/requests") {
    const contentType = req.headers["content-type"] || "";
    let body = "";
    
    // Si es FormData (multipart/form-data), necesitamos parsear diferente
    if (contentType.includes("multipart/form-data")) {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", async () => {
        try {
          // Para FormData, usamos una biblioteca o parseo manual
          // Por simplicidad, convertimos a string y parseamos
          const buffer = Buffer.concat(chunks);
          const boundary = contentType.split("boundary=")[1];
          const parts = buffer.toString().split(`--${boundary}`);
          
          const payload = {};
          let fileData = null;
          let fileName = null;
          
          parts.forEach(part => {
            if (part.includes("Content-Disposition")) {
              const nameMatch = part.match(/name="([^"]+)"/);
              const filenameMatch = part.match(/filename="([^"]+)"/);
              if (nameMatch) {
                const name = nameMatch[1];
                const value = part.split("\r\n\r\n")[1]?.split("\r\n")[0] || "";
                if (filenameMatch) {
                  fileName = filenameMatch[1];
                  // Guardamos el contenido del archivo (simplificado)
                  fileData = part.split("\r\n\r\n")[1]?.split("\r\n--")[0] || "";
                } else {
                  payload[name] = value;
                }
              }
            }
          });
          
          // Si hay archivo, guardarlo en disco
          let attachmentUrl = payload.attachment_url || "";
          if (fileData && fileName) {
            const fs = await import("fs");
            const path = await import("path");
            const uploadsDir = path.join(__dirname, "uploads");
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, `${Date.now()}-${fileName}`);
            fs.writeFileSync(filePath, Buffer.from(fileData, "binary"));
            attachmentUrl = `/uploads/${path.basename(filePath)}`;
          }
          
          payload.attachment_url = attachmentUrl;
          
          const created = addRequest(payload);
          logEvent("info", "request_created", `${created.id} · ${created.client_name} → ${created.project_id}`, {
            request_id: created.id, project: created.project_id, type: created.type, priority: created.priority,
          });
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, request: created }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
    
    // Si es JSON normal (backwards compatibility)
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const created = addRequest(payload);
        logEvent("info", "request_created", `${created.id} · ${created.client_name} → ${created.project_id}`, {
          request_id: created.id, project: created.project_id, type: created.type, priority: created.priority,
        });
        res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true, request: created }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET /api/requests/<id> → detalle de una solicitud
  if (req.method === "GET" && url.pathname.startsWith("/api/requests/")) {
    const id = url.pathname.split("/")[3];
    const r = getRequest(id);
    if (!r) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: `solicitud ${id} no encontrada` }));
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify(r));
  }

  // POST /api/requests/<id>/update → cambiar status/priority/agregar nota
  if (req.method === "POST" && url.pathname.match(/^\/api\/requests\/[^/]+\/update$/)) {
    const id = url.pathname.split("/")[3];
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        const updated = updateRequest(id, payload);
        logEvent("info", "request_updated", `${id} · ${JSON.stringify(payload)}`, { request_id: id, changes: payload });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true, request: updated }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET /api/tests/run → ejecuta los 17 tests
  if (req.method === "GET" && url.pathname === "/api/tests/run") {
    try {
      const baseUrl = `http://localhost:${PORT}`; // self-test
      const results = await runAllTests({ baseUrl });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(results, null, 2));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }
  // POST /api/prompt/grade → evalúa un prompt
  if (req.method === "POST" && url.pathname === "/api/prompt/grade") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", async () => {
      try {
        const { prompt, useModel = false } = JSON.parse(body || "{}");
        if (!prompt) throw new Error("falta prompt");
        const result = await gradePrompt(prompt, {
          useModel,
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(result, null, 2));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  // ──────────── /TESTS ────────────

  // Identity — quién es el asistente
  if (req.method === "GET" && url.pathname === "/identity") {
    try {
      const cfg = JSON.parse(readFileSync(join(__dirname, "mcp-subagents-config.json"), "utf8"));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({
        identity: cfg.identity,
        auth: { domain_allowlist: cfg.auth?.domain_allowlist || [] }
      }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Auth check — valida que el correo sea @retarget.cl
  if (req.method === "POST" && url.pathname === "/auth/check") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { email, name } = JSON.parse(body || "{}");
        const cfg = JSON.parse(readFileSync(join(__dirname, "mcp-subagents-config.json"), "utf8"));
        const allowlist = cfg.auth?.domain_allowlist || ["@retarget.cl"];
        const ok = typeof email === "string" && allowlist.some((d) => email.toLowerCase().endsWith(d));
        res.writeHead(ok ? 200 : 403, { "Content-Type": "application/json; charset=utf-8" });
        if (!ok) {
          return res.end(JSON.stringify({
            authorized: false,
            message: cfg.auth?.on_unauthorized || "No autorizado.",
            signature: cfg.identity?.signature
          }));
        }
        const greeting = name
          ? `Hola ${name}, soy el Asistente de Retarget desarrollado por Sistemas - Retarget ❤️. ¿En qué te ayudo?`
          : cfg.identity?.first_contact_greeting;
        res.end(JSON.stringify({
          authorized: true,
          email,
          name: name || null,
          greeting,
          signature: cfg.identity?.signature
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Team — lista miembros del equipo y cómo escribirles
  if (req.method === "GET" && url.pathname === "/team") {
    try {
      const team = JSON.parse(readFileSync(join(__dirname, "contracts/team.json"), "utf8"));
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(team));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Team — agregar miembro (POST /team)
  if (req.method === "POST" && url.pathname === "/team") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const member = JSON.parse(body);
        if (!member.name || !member.email) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Nombre y email son requeridos" }));
        }
        const teamPath = join(__dirname, "contracts/team.json");
        const team = JSON.parse(readFileSync(teamPath, "utf8"));
        const newMember = {
          id: member.email.toLowerCase().replace(/[^a-z0-9@._-]/g, ""),
          ...member,
          active: member.active !== undefined ? member.active : true
        };
        team.members = team.members || [];
        team.members.push(newMember);
        writeFileSync(teamPath, JSON.stringify(team, null, 2), "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ member: newMember }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Team — actualizar miembro (PUT /team/:id)
  if (req.method === "PUT" && url.pathname.startsWith("/team/")) {
    const id = url.pathname.split("/")[2];
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const updates = JSON.parse(body);
        const teamPath = join(__dirname, "contracts/team.json");
        const team = JSON.parse(readFileSync(teamPath, "utf8"));
        const idx = team.members.findIndex(m => (m.id || m.email) === id);
        if (idx === -1) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Miembro no encontrado" }));
        }
        team.members[idx] = { ...team.members[idx], ...updates };
        writeFileSync(teamPath, JSON.stringify(team, null, 2), "utf8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ member: team.members[idx] }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Team — eliminar miembro (DELETE /team/:id)
  if (req.method === "DELETE" && url.pathname.startsWith("/team/")) {
    const id = url.pathname.split("/")[2];
    try {
      const teamPath = join(__dirname, "contracts/team.json");
      const team = JSON.parse(readFileSync(teamPath, "utf8"));
      const idx = team.members.findIndex(m => (m.id || m.email) === id);
      if (idx === -1) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Miembro no encontrado" }));
      }
      team.members.splice(idx, 1);
      writeFileSync(teamPath, JSON.stringify(team, null, 2), "utf8");
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Notify — el asistente redacta el mensaje listo para copiar/pegar al colaborador correcto
  if (req.method === "POST" && url.pathname === "/notify") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { member_id, vars = {} } = JSON.parse(body || "{}");
        const team = JSON.parse(readFileSync(join(__dirname, "contracts/team.json"), "utf8"));
        const member = team.members.find((m) => m.id === member_id);
        if (!member) {
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: `Miembro no encontrado: ${member_id}. Disponibles: ${team.members.map(m => m.id).join(", ")}` }));
        }
        let msg = (member.message_template || "").replace(/\\n/g, "\n");
        for (const [k, v] of Object.entries(vars)) {
          msg = msg.replaceAll(`{${k}}`, String(v ?? `[${k} pendiente]`));
        }
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          target_member: member.name,
          tone: member.tone,
          how_to_write: member.how_to_write,
          ready_to_send_message: msg,
          instructions: "Copia este mensaje y pégalo en el canal donde escribes a este colaborador."
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Chat — Anthropic tool-use loop (Initial → Tool request → Data retrieval → Final response)
  if (req.method === "POST" && url.pathname === "/chat") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const { email, name, message, messages, model, maxTurns } = payload;

        // Auth: solo @retarget.cl
        const cfg = JSON.parse(readFileSync(join(__dirname, "mcp-subagents-config.json"), "utf8"));
        const allowlist = cfg.auth?.domain_allowlist || ["@retarget.cl"];
        const ok = typeof email === "string" && allowlist.some((d) => email.toLowerCase().endsWith(d));
        if (!ok) {
          res.writeHead(403, { "Content-Type": "application/json; charset=utf-8" });
          return res.end(JSON.stringify({
            authorized: false,
            message: cfg.auth?.on_unauthorized || "No autorizado.",
            signature: cfg.identity?.signature
          }));
        }

        // Construir historial: aceptamos `messages` (array) o `message` (string)
        const history = Array.isArray(messages) && messages.length
          ? messages
          : [{ role: "user", content: String(message || "").slice(0, 8000) }];

        const result = await chatLoop({
          messages: history,
          userEmail: email,
          userName: name,
          model,
          maxTurns: maxTurns || 8
        });

        // Aprovechar el llamado real al /chat para actualizar el caché de salud
        // SIN gastar tokens extra (recordChatOutcome NO llama a la API).
        recordChatOutcome(result);
        if (result?.error) {
          const txt = String(result.error).toLowerCase();
          if (txt.includes("credit balance")) {
            logEvent("critical", "credit_balance_too_low", "Anthropic sin créditos durante /chat", { email });
          } else if (txt.includes("authentication") || txt.includes("api key")) {
            logEvent("critical", "auth_error", "Anthropic API key inválida durante /chat", { email });
          } else {
            logEvent("error", "chat_error", result.error, { email });
          }
        } else {
          logEvent("info", "chat_ok", `Chat completado para ${email}`, { turns: result?.turns });
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          ...result,
          signature: cfg.identity?.signature
        }));
      } catch (err) {
        logEvent("error", "chat_exception", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Tools — lista las herramientas que el chat expone a Claude
  if (req.method === "GET" && url.pathname === "/chat/tools") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ tools: CHAT_TOOLS }));
  }

  // Status
  if (req.method === "GET" && url.pathname === "/status") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      service: "quality-gate-mcp",
      version: "0.3.1",
      started_at: STARTED_AT,
      uptime_seconds: Math.floor((Date.now() - new Date(STARTED_AT).getTime()) / 1000),
      mcp_process_alive: mcpProcess !== null && mcpProcess.exitCode === null,
      pending_requests: pendingRequests.size,
    }));
  }

  // Greet — saludo de inicio de conversación (Cascade lo invoca al abrir cada chat).
  // Devuelve un mensaje breve + estado, para confirmar que el MCP está vivo.
  if (req.method === "GET" && url.pathname === "/greet") {
    try {
      const name = url.searchParams.get("name") || "";
      const email = url.searchParams.get("email") || "";
      const cfg = JSON.parse(readFileSync(join(__dirname, "mcp-subagents-config.json"), "utf8"));
      // /greet por defecto NO consume créditos: lee caché.
      const snapshot = await getHealthSnapshot({
        uptime: Math.floor((Date.now() - new Date(STARTED_AT).getTime()) / 1000),
        mcpAlive: mcpProcess !== null && mcpProcess.exitCode === null,
        probe: false,
      });
      // Proyectos activos (rápido)
      let projects = [];
      try {
        const projectsDir = join(__dirname, "mcp-projects");
        const files = readdirSync(projectsDir).filter(f => f.endsWith("-config.json"));
        projects = files.map(f => {
          const p = JSON.parse(readFileSync(join(projectsDir, f), "utf8"));
          return {
            id: p.id || f.replace("-config.json", ""),
            name: p.project_name || p.id,
            progress: p.replication?.progress_percent ?? 0,
            current_step: p.workflow?.current_step || "—",
          };
        });
      } catch {}

      const icon = snapshot.overall === "healthy" ? "🟢" : (snapshot.mcp?.alive ? "🟠" : "🔴");
      const who = name ? `Hola ${name}` : "Hola";
      const status =
        snapshot.overall === "healthy"
          ? `MCP operativo. Anthropic OK. ${projects.length} proyecto(s) activo(s).`
          : snapshot.cascade_message;

      const greeting = `${icon} ${who}, soy el Asistente de Retarget. ${status}`;
      logEvent("info", "greet", `Saludo emitido a ${name || email || "anon"}`);

      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({
        greeting,
        overall: snapshot.overall,
        mcp_alive: snapshot.mcp?.alive,
        anthropic_status: snapshot.anthropic?.status,
        anthropic_action: snapshot.anthropic?.action || null,
        active_projects: projects,
        roadmap_url: `${url.protocol}//${req.headers.host}/roadmap`,
        signature: cfg.identity?.signature || "— Sistemas Retarget ❤️",
      }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message, greeting: "🔴 MCP no respondió correctamente." }));
    }
  }

  // Health — snapshot completo (para Cascade/Windsurf/dashboards)
  // Detecta créditos de Anthropic, API key inválida, MCP caído, etc.
  if (req.method === "GET" && url.pathname === "/health") {
    try {
      // ?force=1 → CONSUME ~1 token de Anthropic para verificar de verdad
      // (sin force) → NO consume, lee del caché actualizado por el último /chat
      const force = url.searchParams.get("force") === "1";
      const snapshot = await getHealthSnapshot({
        uptime: Math.floor((Date.now() - new Date(STARTED_AT).getTime()) / 1000),
        mcpAlive: mcpProcess !== null && mcpProcess.exitCode === null,
        probe: force,
      });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(snapshot, null, 2));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Events — log en memoria (últimos N eventos relevantes)
  if (req.method === "GET" && url.pathname === "/events") {
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ events: getEvents(limit), count: getEvents(limit).length }));
  }

  // Roadmap — HTML interactivo con estado del MCP, eventos y proyectos
  if (req.method === "GET" && (url.pathname === "/roadmap" || url.pathname === "/roadmap/")) {
    try {
      const html = readFileSync(join(__dirname, "roadmap/index.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Monitor — HTML para ver solicitudes por proyecto
  if (req.method === "GET" && (url.pathname === "/monitor" || url.pathname === "/monitor/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/monitor.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Sitemap — HTML para ver estructura del sitio y QA
  if (req.method === "GET" && (url.pathname === "/sitemap" || url.pathname === "/sitemap/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/sitemap.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Sitemap Detail — HTML para ver detalle QA de una sección
  if (req.method === "GET" && (url.pathname === "/sitemap-detail" || url.pathname === "/sitemap-detail/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/sitemap-detail.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Google Workspace — HTML para integración con Gmail, Meet, Chat
  if (req.method === "GET" && (url.pathname === "/google-workspace" || url.pathname === "/google-workspace/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/google-workspace.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // ──────────── PROJECTS DASHBOARD ────────────
  // HTML: listado de proyectos
  if (req.method === "GET" && (url.pathname === "/projects" || url.pathname === "/projects/")) {
    try {
      const html = readFileSync(join(__dirname, "projects-ui/index.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }
  // HTML: detalle de un proyecto (requiere :id)
  // Cualquier ruta /projects/<id> que no sea API se sirve con detail.html (SPA-style).
  if (req.method === "GET" && url.pathname.startsWith("/projects/") && !url.pathname.startsWith("/projects/api")) {
    const id = url.pathname.split("/")[2];
    if (id && id !== "api") {
      try {
        const html = readFileSync(join(__dirname, "projects-ui/detail.html"), "utf8");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(html);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }
  }

  // API: listar proyectos (con counts de feedback/errors/reasoning)
  if (req.method === "GET" && (url.pathname === "/api/projects/list" || url.pathname === "/api/projects")) {
    try {
      const statusFilter = url.searchParams.get("status");
      const projects = listProjects({ status: statusFilter, exclude_status: url.searchParams.get("exclude_status") });
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ projects, count: projects.length }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // API: crear proyecto rápido (para cambios simples como banners)
  if (req.method === "POST" && url.pathname === "/api/projects/quick-create") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body || "{}");
        if (!payload.name) throw new Error("name es requerido");
        const result = quickCreateProject(payload.name, payload.description);
        logEvent("info", "quick_project_created", `Proyecto rápido: ${result.project_id}`);
        res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true, ...result }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: rutas /api/projects/<id>/...
  if (url.pathname.startsWith("/api/projects/")) {
    const parts = url.pathname.split("/").filter(Boolean); // ["api","projects","<id>","<sub?>"]
    const projectId = parts[2];
    const sub = parts[3];

    // GET /api/projects/<id>/full → config + feedback + errors + reasoning
    if (req.method === "GET" && sub === "full") {
      const data = getProjectFull(projectId);
      if (!data) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: `Proyecto no encontrado: ${projectId}` }));
      }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify(data));
    }

    // GET /api/projects/<id> → solo config (legacy)
    if (req.method === "GET" && !sub) {
      try {
        const config = JSON.parse(readFileSync(join(__dirname, `mcp-projects/${projectId}-config.json`), "utf8"));
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(config));
      } catch {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: `Proyecto no encontrado: ${projectId}` }));
      }
    }

    // POST /api/projects/<id>/status — body: {status: "active"|"archived"|"paused"}
    if (req.method === "POST" && sub === "status") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          const result = setProjectStatus(projectId, payload.status);
          logEvent("info", "project_status_changed", `${projectId} → ${payload.status}`, { project: projectId, status: payload.status });
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, ...result }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // POST /api/projects/<id>/landings/<landingId>/{screenshot|progress|pagespeed|capture}
    if (req.method === "POST" && sub === "landings" && parts[4] && parts[5]) {
      const landingId = parts[4];
      const action = parts[5]; // "screenshot" | "progress" | "pagespeed" | "capture"
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", async () => {
        try {
          const payload = JSON.parse(body || "{}");
          let saved;
          if (action === "screenshot") saved = setLandingScreenshot(projectId, landingId, payload);
          else if (action === "progress") saved = updateLandingProgress(projectId, landingId, payload);
          else if (action === "review-score") saved = setReviewScore(projectId, landingId, payload);
          else if (action === "pagespeed") saved = await setLandingPageSpeed(projectId, landingId, payload);
          else if (action === "capture") saved = await captureLandingScreenshot(projectId, landingId, payload);
          else throw new Error("Action no soportado: " + action);
          logEvent("info", `landing_${action}`, `${projectId}/${landingId}`, { project: projectId, landing: landingId });
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, landing: landingId, item: saved }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // POST /api/projects/<id>/landings/<lid>/observation — agregar observación a landing
    if (req.method === "POST" && sub === "landings" && parts[4] && parts[5] === "observation") {
      const landingId = parts[4];
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          const obs = addLandingObservation(projectId, landingId, payload);
          logEvent("info", "landing_observation", `Observación en ${projectId}/${landingId}`);
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, observation: obs }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // POST /api/projects/<id>/{feedback|errors|reasoning|deploy|annotations}
    if (req.method === "POST" && ["feedback", "errors", "reasoning", "deploy", "annotations"].includes(sub)) {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        try {
          const payload = JSON.parse(body || "{}");
          let saved;
          if (sub === "feedback")    saved = addFeedback(projectId, payload);
          if (sub === "errors")      saved = addError(projectId, payload);
          if (sub === "reasoning")   saved = addReasoning(projectId, payload);
          if (sub === "deploy")      saved = setDeploy(projectId, payload);
          if (sub === "annotations") saved = addAnnotation(projectId, payload);
          logEvent("info", `project_${sub}`, `Nuevo ${sub} en ${projectId}`, { project: projectId });
          res.writeHead(201, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ ok: true, item: saved }));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // GET /api/projects/<id>/{feedback|errors|reasoning} → listas individuales
    if (req.method === "GET" && ["feedback", "errors", "reasoning"].includes(sub)) {
      const data = getProjectFull(projectId);
      if (!data) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: `Proyecto no encontrado: ${projectId}` }));
      }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ items: data.runtime?.[sub] || [] }));
    }
  }
  // ──────────── /PROJECTS DASHBOARD ────────────

  // MCP proxy endpoint
  if (req.method === "POST" && url.pathname === "/mcp") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const message = JSON.parse(body);
        const response = await sendToMcp(message);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Onboarding — recibe perfil del cuestionario y lo guarda en contracts/roles/
  if (req.method === "POST" && url.pathname === "/onboarding") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const profile = JSON.parse(body);
        const rolesDir = join(__dirname, "contracts/roles");
        mkdirSync(rolesDir, { recursive: true });
        const fileName = join(rolesDir, `${profile.token}.json`);
        writeFileSync(fileName, JSON.stringify(profile, null, 2), "utf8");
        console.log(`[onboarding] Profile saved: ${profile.token}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, token: profile.token, saved: fileName }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Onboarding landing — sirve el HTML del cuestionario
  if (req.method === "GET" && url.pathname === "/onboarding") {
    try {
      const html = readFileSync(join(__dirname, "onboarding/index.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Onboarding page not found");
    }
  }

  // Website validation endpoint
  if (req.method === "POST" && url.pathname === "/api/v1/validate-website") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        
        if (!data || !data.url) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "URL requerida" }));
        }

        const url = data.url;
        const strategy = data.strategy || "mobile";

        const results = {
          url,
          passed: true,
          overall_score: 0,
          core_web_vitals: {},
          google_ads_policies: {},
          seo_technical: {},
          mobile_first: {},
          mobile_first_compliant: false,
          issues: [],
          recommendations: []
        };

        // Core Web Vitals
        const cwvResults = await validateCoreWebVitals(url, process.env.PAGESPEED_API_KEY);
        results.core_web_vitals = cwvResults;
        if (!cwvResults.passed) results.passed = false;
        if (cwvResults.issues) results.issues.push(...cwvResults.issues);

        // Google Ads Policies
        const adsResults = await validateGoogleAdsPolicies(url);
        results.google_ads_policies = adsResults;
        if (!adsResults.passed) results.passed = false;
        if (adsResults.issues) results.issues.push(...adsResults.issues);
        if (adsResults.warnings) results.recommendations.push(...adsResults.warnings);

        // SEO Técnico
        const seoResults = await validateSEOTechnical(url);
        results.seo_technical = seoResults;
        if (!seoResults.passed) results.passed = false;
        if (seoResults.issues) results.issues.push(...seoResults.issues);
        if (seoResults.recommendations) results.recommendations.push(...seoResults.recommendations);

        // Mobile First
        const mobileResults = await validateMobileFirst(url);
        results.mobile_first = mobileResults;
        results.mobile_first_compliant = mobileResults.mobile_first_compliant || false;
        if (!mobileResults.passed) results.passed = false;
        if (mobileResults.issues) results.issues.push(...mobileResults.issues);
        if (mobileResults.recommendations) results.recommendations.push(...mobileResults.recommendations);

        // Calculate overall score
        const scores = [];
        if (cwvResults.overall_score) scores.push(cwvResults.overall_score * 0.25);
        if (seoResults.score) scores.push(seoResults.score * 0.25);
        if (mobileResults.score) scores.push(mobileResults.score * 0.25);
        if (adsResults.passed) scores.push(100 * 0.25);
        else scores.push(0 * 0.25);

        results.overall_score = Math.round(scores.reduce((a, b) => a + b, 0));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(results));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Servir archivos subidos (uploads)
  if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
    const fs = await import("fs");
    const path = await import("path");
    const fileName = url.pathname.split("/")[2];
    const filePath = path.join(__dirname, "uploads", fileName);
    try {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(fileName).toLowerCase();
      const contentTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".txt": "text/plain",
        ".zip": "application/zip"
      };
      const contentType = contentTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      return res.end(data);
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "File not found" }));
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

startMcpProcess();
server.listen(PORT, () => {
  console.log(`[wrapper] HTTP server listening on port ${PORT}`);
  console.log(`[wrapper] MCP endpoint: POST http://localhost:${PORT}/mcp`);
  console.log(`[wrapper] Status: GET http://localhost:${PORT}/status`);
  console.log(`[wrapper] Health: GET http://localhost:${PORT}/health`);
  console.log(`[wrapper] Roadmap: GET http://localhost:${PORT}/roadmap`);
  logEvent("info", "boot", "MCP HTTP wrapper iniciado", { port: PORT });
  // NO hacemos health-checks automáticos a Anthropic para NO consumir créditos.
  // El estado se actualiza únicamente:
  //   1) Cuando alguien usa /chat (capturamos el resultado real)
  //   2) Cuando alguien hace GET /health?force=1 (probe explícito)
  // Por defecto /health y /greet leen del caché (status: "unknown" si nunca se probó).
});
