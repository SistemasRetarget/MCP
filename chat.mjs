/**
 * Tool-use chat loop con Anthropic — patrón oficial:
 *  1) Initial request: el usuario manda pregunta + el server expone tools
 *  2) Tool request: Claude responde con tool_use bloque
 *  3) Data retrieval: nuestro server ejecuta la tool
 *  4) Final response: devolvemos tool_result a Claude y obtenemos texto final
 *
 * El loop continúa hasta stop_reason === "end_turn" o se alcanza maxTurns.
 *
 * Sin SDK: usamos fetch() nativo de Node 20+.
 */

import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { validateCoreWebVitals } from "./validators/core-web-vitals.mjs";
import { validateGoogleAdsPolicies } from "./validators/google-ads-policies.mjs";
import { validateSEOTechnical } from "./validators/seo-technical.mjs";
import { validateMobileFirst } from "./validators/mobile-first.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

/* ---------- Tool definitions exposed to Claude ---------- */
export const TOOLS = [
  {
    name: "get_identity",
    description: "Devuelve la identidad del Asistente Retarget (nombre, firma, saludo, estilo). Úsalo cuando alguien pregunta quién eres o cuando vayas a presentarte.",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "get_team",
    description: "Lista los miembros del equipo Retarget (Luis, Jefe 2, Periodista) con su tono, cómo escribirles y plantillas de mensaje.",
    input_schema: { type: "object", properties: {}, required: [] }
  },
  {
    name: "draft_message_to_member",
    description: "Redacta un mensaje listo para copiar/pegar a un miembro del equipo, respetando su tono y plantilla. Úsalo SIEMPRE que detectes un bloqueo que requiere a otra persona.",
    input_schema: {
      type: "object",
      properties: {
        member_id: { type: "string", enum: ["luis", "jefe-2", "periodista"], description: "Quién recibe el mensaje" },
        vars: { type: "object", description: "Variables para llenar la plantilla del miembro (ej: {pedido, tarea, propuesta, razon, link_fuente, riesgo, screenshot_path, alternativa, por_que_no, tema, dato, url, ...})" }
      },
      required: ["member_id", "vars"]
    }
  },
  {
    name: "fetch_url",
    description: "Descarga el contenido (HTML/texto/JSON) de una URL pública. Úsalo para tareas investigativas: devuelve también el link como fuente para citar.",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL completa con https://" },
        max_chars: { type: "integer", description: "Límite de caracteres a devolver (default 8000)" }
      },
      required: ["url"]
    }
  },
  {
    name: "save_evidence",
    description: "Guarda respaldo (texto/JSON) de una investigación en evidence/${project}/${view}/. Devuelve el path. Úsalo junto con fetch_url cuando el resultado vaya a Jefe 2 o Periodista.",
    input_schema: {
      type: "object",
      properties: {
        project: { type: "string" },
        view: { type: "string", description: "Nombre lógico de la vista/tema" },
        filename: { type: "string", description: "ej: backup.html, reasoning.md, source.txt" },
        content: { type: "string" }
      },
      required: ["project", "view", "filename", "content"]
    }
  },
  {
    name: "validate_website",
    description: "Audita un sitio web: Core Web Vitals, políticas Google Ads, SEO técnico y Mobile First. Devuelve score y issues.",
    input_schema: {
      type: "object",
      properties: {
        url: { type: "string" },
        strategy: { type: "string", enum: ["mobile", "desktop"], description: "default mobile" }
      },
      required: ["url"]
    }
  },
  {
    name: "search_lessons",
    description: "Busca en la base de lecciones aprendidas (KB local) un patrón. Úsalo ANTES de declarar bloqueado.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"]
    }
  }
];

/* ---------- Tool runners ---------- */
async function runTool(name, input) {
  switch (name) {
    case "get_identity": {
      const cfg = JSON.parse(readFileSync(join(__dirname, "mcp-subagents-config.json"), "utf8"));
      return { identity: cfg.identity, auth_domain: cfg.auth?.domain_allowlist };
    }
    case "get_team": {
      return JSON.parse(readFileSync(join(__dirname, "contracts/team.json"), "utf8"));
    }
    case "draft_message_to_member": {
      const team = JSON.parse(readFileSync(join(__dirname, "contracts/team.json"), "utf8"));
      const member = team.members.find((m) => m.id === input.member_id);
      if (!member) return { error: `Miembro no encontrado: ${input.member_id}` };
      let msg = (member.message_template || "").replace(/\\n/g, "\n");
      for (const [k, v] of Object.entries(input.vars || {})) {
        msg = msg.replaceAll(`{${k}}`, String(v ?? `[${k} pendiente]`));
      }
      return {
        target_member: member.name,
        tone: member.tone,
        how_to_write: member.how_to_write,
        ready_to_send_message: msg
      };
    }
    case "fetch_url": {
      const max = input.max_chars || 8000;
      try {
        const r = await fetch(input.url, { headers: { "User-Agent": "AsistenteRetarget/1.0" }, redirect: "follow" });
        const text = await r.text();
        return {
          source_link: input.url,
          status: r.status,
          content_type: r.headers.get("content-type"),
          length_chars: text.length,
          truncated: text.length > max,
          content: text.slice(0, max)
        };
      } catch (err) {
        return { source_link: input.url, error: err.message };
      }
    }
    case "save_evidence": {
      const dir = join(__dirname, "evidence", input.project, input.view);
      mkdirSync(dir, { recursive: true });
      const path = join(dir, input.filename);
      writeFileSync(path, input.content, "utf8");
      return { saved_at: path.replace(__dirname + "/", "") };
    }
    case "validate_website": {
      const url = input.url;
      const cwv = await validateCoreWebVitals(url, process.env.PAGESPEED_API_KEY);
      const ads = await validateGoogleAdsPolicies(url);
      const seo = await validateSEOTechnical(url);
      const mob = await validateMobileFirst(url);
      return {
        url,
        core_web_vitals: cwv,
        google_ads_policies: ads,
        seo_technical: seo,
        mobile_first: mob
      };
    }
    case "search_lessons": {
      try {
        const path = join(__dirname, "lessons/lessons.jsonl");
        const lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
        const q = (input.query || "").toLowerCase();
        const hits = lines
          .map((l) => { try { return JSON.parse(l); } catch { return null; } })
          .filter((x) => x && JSON.stringify(x).toLowerCase().includes(q))
          .slice(0, 5);
        return { matches: hits.length, results: hits };
      } catch {
        return { matches: 0, results: [] };
      }
    }
    default:
      return { error: `Tool desconocida: ${name}` };
  }
}

/* ---------- System prompt baked from identity + protocols ---------- */
function buildSystemPrompt() {
  const cfg = JSON.parse(readFileSync(join(__dirname, "mcp-subagents-config.json"), "utf8"));
  const id = cfg.identity || {};
  const research = cfg.research_protocol || {};
  const collab = cfg.collaboration_protocol || {};
  return [
    `Eres ${id.name} — desarrollado por ${id.developed_by}.`,
    `Firma siempre con: ${id.signature}`,
    `Saludo de primer contacto: ${id.first_contact_greeting}`,
    `Si no sabes el nombre del usuario, pídeselo.`,
    `${id.self_description}`,
    ``,
    `ESTILO:`,
    `- Sé humano, directo y útil.`,
    `- NUNCA falles en silencio. Si te bloqueas, identifica al colaborador correcto y usa la tool draft_message_to_member para entregar al usuario el mensaje exacto que debe copiar/pegar.`,
    `- Antes de declararte bloqueado: intenta tú, busca en search_lessons, haz una sola pregunta clara, y solo entonces redacta el mensaje al colaborador.`,
    `- Siempre ofrece el siguiente paso.`,
    ``,
    `PROTOCOLO DE EVIDENCIAS (obligatorio en investigaciones):`,
    `- Cita la URL fuente.`,
    `- Usa fetch_url para obtener el contenido y save_evidence para respaldarlo.`,
    `- Si la respuesta va a Jefe 2: él es desconfiado. Da 3 bullets, cada uno con fuente, screenshot y la alternativa que descartaste.`,
    `- Si la respuesta va a Periodista: él exige certeza. Cada dato con (fuente: url). Distingue hecho vs opinión. Si no tienes fuente, marca "sin verificar".`,
    ``,
    `EQUIPO disponible (usa get_team para detalles): luis, jefe-2, periodista.`,
    `AUTH: solo correos @retarget.cl pueden usar este asistente.`
  ].join("\n");
}

/* ---------- Main loop ---------- */
export async function chatLoop({ messages, userEmail, userName, model, maxTurns = 8 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "ANTHROPIC_API_KEY no configurada en el servidor.", hint: "Agrega el secreto en Cloud Run." };
  }
  const system = buildSystemPrompt() +
    (userEmail ? `\n\nUsuario actual: ${userEmail}${userName ? ` (${userName})` : ""}.` : "");

  let history = [...messages];
  const trace = [];

  for (let turn = 0; turn < maxTurns; turn++) {
    const body = {
      model: model || DEFAULT_MODEL,
      max_tokens: 2048,
      system,
      tools: TOOLS,
      messages: history
    };
    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (data.type === "error" || !data.content) {
      return { error: data.error?.message || "Error en Anthropic API", raw: data };
    }
    trace.push({ turn, stop_reason: data.stop_reason });

    // Append assistant turn
    history.push({ role: "assistant", content: data.content });

    if (data.stop_reason === "end_turn" || data.stop_reason === "stop_sequence") {
      const textBlocks = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
      return { reply: textBlocks, turns: turn + 1, trace };
    }

    if (data.stop_reason === "tool_use") {
      const toolUses = data.content.filter((b) => b.type === "tool_use");
      const toolResults = [];
      for (const tu of toolUses) {
        const result = await runTool(tu.name, tu.input || {});
        trace.push({ tool: tu.name, input: tu.input, result_preview: JSON.stringify(result).slice(0, 200) });
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: typeof result === "string" ? result : JSON.stringify(result)
        });
      }
      history.push({ role: "user", content: toolResults });
      continue;
    }

    // Otros stop_reason: max_tokens etc.
    const fallbackText = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return { reply: fallbackText, turns: turn + 1, trace, stop_reason: data.stop_reason };
  }
  return { error: `Se alcanzó maxTurns=${maxTurns} sin end_turn`, trace };
}
