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
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { validateCoreWebVitals } from "./validators/core-web-vitals.mjs";
import { validateGoogleAdsPolicies } from "./validators/google-ads-policies.mjs";
import { validateSEOTechnical } from "./validators/seo-technical.mjs";
import { validateMobileFirst } from "./validators/mobile-first.mjs";
import { chatLoop, TOOLS as CHAT_TOOLS } from "./chat.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || "8080", 10);
const MCP_BIN = join(__dirname, "servers/quality-gate/target/release/quality-gate-server");
const STARTED_AT = new Date().toISOString();

// Spawn MCP process (persistent, reused across requests)
let mcpProcess = null;
let pendingRequests = new Map(); // id → { resolve, reject, timer }
let buffer = "";

function startMcpProcess() {
  mcpProcess = spawn(MCP_BIN, [], {
    env: {
      ...process.env,
      WORKSPACE_MCP_HOME: process.env.WORKSPACE_MCP_HOME || __dirname,
      RETARGET_WORKSPACE: process.env.RETARGET_WORKSPACE || join(__dirname, "contracts"),
    },
    stdio: ["pipe", "pipe", "pipe"],
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
    console.error(`[wrapper] MCP process exited with code ${code}. Restarting in 1s...`);
    mcpProcess = null;
    pendingRequests.forEach(({ reject, timer }) => {
      clearTimeout(timer);
      reject(new Error("MCP process died"));
    });
    pendingRequests.clear();
    setTimeout(startMcpProcess, 1000);
  });

  console.log("[wrapper] MCP process started, PID:", mcpProcess.pid);
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

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({
          ...result,
          signature: cfg.identity?.signature
        }));
      } catch (err) {
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

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

startMcpProcess();
server.listen(PORT, () => {
  console.log(`[wrapper] HTTP server listening on port ${PORT}`);
  console.log(`[wrapper] MCP endpoint: POST http://localhost:${PORT}/mcp`);
  console.log(`[wrapper] Status: GET http://localhost:${PORT}/status`);
});
