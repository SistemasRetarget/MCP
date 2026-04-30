/**
 * Health Monitor — Detecta el estado del MCP y de la API de Anthropic.
 *
 * Casos críticos detectados:
 *  - "credit_balance_too_low" → Anthropic API sin créditos
 *  - "auth_error"             → API key inválida / revocada
 *  - "rate_limited"           → 429 from Anthropic
 *  - "no_api_key"             → ANTHROPIC_API_KEY no configurada
 *  - "anthropic_unreachable"  → no se puede contactar la API
 *  - "ok"                     → todo bien
 *
 * Mantiene un buffer en memoria (últimos 100 eventos) para que /events
 * y /roadmap puedan mostrar el historial sin necesidad de DB.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const CHECK_MODEL = "claude-3-5-haiku-20241022"; // el más barato para health-checks
let lastCheck = null;          // { at, status, detail, raw }
let cachedFor = 60_000;         // 60s — evita gastar tokens en cada poll
const events = [];              // ring buffer
const MAX_EVENTS = 100;

export function logEvent(level, type, message, meta = {}) {
  const evt = {
    at: new Date().toISOString(),
    level,        // "info" | "warn" | "error" | "critical"
    type,         // "credit_balance_too_low", "deploy", "phase_complete", ...
    message,
    meta,
  };
  events.push(evt);
  if (events.length > MAX_EVENTS) events.shift();
  // Log a stdout para que Cloud Run lo capture
  console.log(`[mcp-event] ${level.toUpperCase()} ${type}: ${message}`);
  return evt;
}

export function getEvents(limit = 50) {
  return events.slice(-limit).reverse();
}

/**
 * Clasifica un error de Anthropic a partir del payload de respuesta.
 */
function classifyAnthropicError(status, body) {
  const text = JSON.stringify(body || "").toLowerCase();
  if (status === 401 || text.includes("invalid api key") || text.includes("authentication")) {
    return { status: "auth_error", critical: true, action: "Regenerar la API key en console.anthropic.com" };
  }
  if (status === 429 || text.includes("rate")) {
    return { status: "rate_limited", critical: false, action: "Esperar unos segundos y reintentar." };
  }
  if (text.includes("credit balance") || text.includes("credits")) {
    return {
      status: "credit_balance_too_low",
      critical: true,
      action: "Cargar créditos en https://console.anthropic.com/settings/billing",
    };
  }
  if (status >= 500) {
    return { status: "anthropic_unreachable", critical: false, action: "Reintentar — problema transitorio en Anthropic." };
  }
  return { status: "unknown_error", critical: true, action: `Revisar payload: ${text.slice(0, 200)}` };
}

/**
 * Hace un health-check real contra la API de Anthropic.
 * Usa un prompt mínimo (1 token de output) para minimizar costo:
 * solo gastará créditos si hay créditos.
 */
export async function checkAnthropic({ force = false } = {}) {
  // Cache: no chequear más seguido que `cachedFor`
  if (!force && lastCheck && Date.now() - new Date(lastCheck.at).getTime() < cachedFor) {
    return lastCheck;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    lastCheck = {
      at: new Date().toISOString(),
      status: "no_api_key",
      critical: true,
      action: "Configurar ANTHROPIC_API_KEY en Secret Manager y redeployear.",
      detail: "La variable de entorno ANTHROPIC_API_KEY no está presente.",
    };
    logEvent("critical", "no_api_key", lastCheck.detail);
    return lastCheck;
  }

  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 10_000);

    const resp = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CHECK_MODEL,
        max_tokens: 1,
        messages: [{ role: "user", content: "ok" }],
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timeout);

    if (resp.ok) {
      lastCheck = {
        at: new Date().toISOString(),
        status: "ok",
        critical: false,
        action: null,
        detail: "Anthropic API respondió correctamente.",
      };
      // Solo registrar OK si veníamos de un fallo
      const prev = events[events.length - 1];
      if (prev && prev.level !== "info") {
        logEvent("info", "anthropic_recovered", "Anthropic API operativa de nuevo.");
      }
      return lastCheck;
    }

    let payload = null;
    try { payload = await resp.json(); } catch { payload = await resp.text().catch(() => ""); }
    const cls = classifyAnthropicError(resp.status, payload);
    lastCheck = {
      at: new Date().toISOString(),
      ...cls,
      detail: typeof payload === "string" ? payload.slice(0, 300) : (payload?.error?.message || JSON.stringify(payload).slice(0, 300)),
    };
    logEvent(cls.critical ? "critical" : "warn", cls.status, lastCheck.detail, { http_status: resp.status });
    return lastCheck;
  } catch (err) {
    lastCheck = {
      at: new Date().toISOString(),
      status: "anthropic_unreachable",
      critical: false,
      action: "Verificar conectividad de salida de Cloud Run.",
      detail: err.message,
    };
    logEvent("warn", "anthropic_unreachable", err.message);
    return lastCheck;
  }
}

/**
 * Devuelve el snapshot completo de salud — apto para Cascade/Windsurf
 * para consultar cada cierto tiempo.
 */
export async function getHealthSnapshot({ uptime, mcpAlive }) {
  const anthropic = await checkAnthropic();
  const overall = anthropic.critical ? "degraded" : (mcpAlive ? "healthy" : "degraded");
  return {
    overall,                // "healthy" | "degraded"
    at: new Date().toISOString(),
    mcp: { alive: mcpAlive, uptime_seconds: uptime },
    anthropic,              // { status, critical, action, detail, at }
    operational: {
      chat_endpoint: anthropic.status === "ok",
      validators:   true,    // independientes de Anthropic
      notify:       true,    // templates locales
    },
    cascade_message: buildCascadeMessage(anthropic, mcpAlive),
  };
}

function buildCascadeMessage(anthropic, mcpAlive) {
  if (!mcpAlive) {
    return "🔴 MCP DOWN — el proceso quality-gate no está corriendo. Reiniciar Cloud Run.";
  }
  if (anthropic.status === "ok") {
    return "🟢 MCP OPERATIVO — todos los sistemas funcionando.";
  }
  if (anthropic.status === "credit_balance_too_low") {
    return "🟠 MCP DEGRADADO — Anthropic SIN CRÉDITOS. /chat no funciona. " + anthropic.action;
  }
  if (anthropic.status === "no_api_key") {
    return "🔴 MCP MAL CONFIGURADO — falta ANTHROPIC_API_KEY. " + anthropic.action;
  }
  if (anthropic.status === "auth_error") {
    return "🔴 MCP MAL CONFIGURADO — API key inválida/revocada. " + anthropic.action;
  }
  return `🟠 MCP DEGRADADO — ${anthropic.status}. ${anthropic.action || ""}`;
}
