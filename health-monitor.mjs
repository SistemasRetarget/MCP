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
 * Devuelve el último estado conocido SIN hacer ninguna llamada a Anthropic.
 * Usado por /health y /greet por defecto — NO consume créditos.
 */
export function getCachedAnthropicStatus() {
  if (lastCheck) return lastCheck;
  return {
    at: null,
    status: "unknown",
    critical: false,
    action: "Estado desconocido — usar GET /health?force=1 para probar (consume ~1 token).",
    detail: "Aún no se ha hecho ningún probe ni se ha llamado a /chat.",
  };
}

/**
 * Registra el estado de Anthropic a partir del resultado real de un /chat.
 * Esta es la forma PASIVA de actualizar el estado: aprovechamos el llamado
 * que el usuario ya hizo, sin gastar tokens extra.
 */
export function recordChatOutcome(result) {
  if (result?.error) {
    const txt = String(result.error).toLowerCase();
    if (txt.includes("credit balance")) {
      lastCheck = {
        at: new Date().toISOString(),
        status: "credit_balance_too_low",
        critical: true,
        action: "Cargar créditos en https://console.anthropic.com/settings/billing",
        detail: result.error,
      };
    } else if (txt.includes("authentication") || txt.includes("invalid api key")) {
      lastCheck = {
        at: new Date().toISOString(),
        status: "auth_error",
        critical: true,
        action: "Regenerar la API key.",
        detail: result.error,
      };
    } else {
      lastCheck = {
        at: new Date().toISOString(),
        status: "unknown_error",
        critical: false,
        action: "Revisar payload.",
        detail: result.error,
      };
    }
  } else {
    lastCheck = {
      at: new Date().toISOString(),
      status: "ok",
      critical: false,
      action: null,
      detail: "Anthropic respondió correctamente al último /chat.",
    };
  }
  return lastCheck;
}

/**
 * Hace un health-check REAL contra la API de Anthropic.
 * ⚠️ CONSUME 1 TOKEN (~$0.0000003) — solo se invoca con ?force=1 explícito.
 * Por defecto retorna el caché.
 */
export async function checkAnthropic({ force = false } = {}) {
  // Cache: no chequear más seguido que `cachedFor`
  if (!force && lastCheck && Date.now() - new Date(lastCheck.at).getTime() < cachedFor) {
    return lastCheck;
  }
  // Sin force y sin caché previo: NO probamos, devolvemos "unknown"
  if (!force && !lastCheck) {
    return getCachedAnthropicStatus();
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
 * Snapshot de salud — apto para Cascade/Windsurf.
 * Por defecto NO consume créditos: lee el estado del caché.
 * Si se pasa `probe: true`, fuerza una prueba real (consume ~1 token).
 */
export async function getHealthSnapshot({ uptime, mcpAlive, probe = false }) {
  const anthropic = probe ? await checkAnthropic({ force: true }) : getCachedAnthropicStatus();
  // overall: si no hemos probado nunca y MCP está vivo, lo damos como "healthy" optimista
  const overall =
    anthropic.critical ? "degraded" :
    !mcpAlive ? "degraded" :
    anthropic.status === "unknown" ? "healthy" :
    "healthy";
  return {
    overall,
    at: new Date().toISOString(),
    mcp: { alive: mcpAlive, uptime_seconds: uptime },
    anthropic,              // { status, critical, action, detail, at }
    operational: {
      chat_endpoint: anthropic.status === "ok" || anthropic.status === "unknown",
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
  if (anthropic.status === "unknown") {
    return "🟢 MCP OPERATIVO — Anthropic no probado aún (no se ha gastado ningún crédito). Usa /chat o /health?force=1 para verificar.";
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
