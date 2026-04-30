/**
 * Prompt Grader — replica el workflow del curso oficial Anthropic.
 *
 * Curso: https://anthropic.skilljar.com/claude-with-the-anthropic-api
 * Módulo: "Prompt evaluation" — Code-based grading + Model-based grading.
 *
 * Cada prompt del usuario se evalúa contra los 7 criterios del rubric
 * (`prompt-engineering-rubric.json`). El score combinado va de 0 a 100.
 *
 * IMPORTANTE: el code-based grading NUNCA llama a Anthropic, así que
 * nunca consume créditos. El model-based grading sí (opcional, requiere
 * créditos disponibles).
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUBRIC = JSON.parse(readFileSync(join(__dirname, "..", "prompt-engineering-rubric.json"), "utf8"));

/**
 * CODE-BASED GRADER — heurísticas que NO consumen créditos.
 * Inspirado directamente en "Code based grading" del curso Anthropic.
 *
 * Devuelve { score: 0-100, breakdown: { criterion_id: 0-100 }, tips: [...] }
 */
export function codeBasedGrade(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return { score: 0, breakdown: {}, tips: ["Prompt vacío"], strategy: "code-based" };
  }
  const text = prompt.toLowerCase();
  const breakdown = {};

  // T1 — Clear and Direct (verbos accionables al inicio)
  const actionVerbs = /^(resume|resúmeme|genera|crea|escribe|lista|compara|analiza|explica|traduce|extrae|clasifica|summarize|generate|write|list|compare|analyze|explain)/i;
  const hasMultipleQuestions = (prompt.match(/\?/g) || []).length > 2;
  let s1 = 0;
  if (actionVerbs.test(prompt.trim())) s1 += 60;
  if (prompt.length > 30) s1 += 20;
  if (!hasMultipleQuestions) s1 += 20;
  breakdown.clear_direct = Math.min(100, s1);

  // T2 — Output Format (palabras como JSON, tabla, bullets, formato, longitud)
  const formatHints = /\b(json|tabla|table|bullets?|markdown|párrafos?|paragraphs?|máximo \d|al menos \d|en \d palabras|en \d items|formato|format)\b/i;
  breakdown.output_format = formatHints.test(prompt) ? 100 : (prompt.length > 100 ? 30 : 10);

  // T3 — Few-shot examples (presencia de "ejemplo", "example", o estructura con --- separadores)
  const fewShot = /\b(ejemplo|example|por ejemplo|for example|<example>|input:|output:)/i;
  breakdown.examples = fewShot.test(prompt) ? 100 : 0;

  // T4 — Role assignment ("Eres un experto en", "actúa como", "you are")
  const role = /\b(eres un|actúa como|act as|you are|asume el rol|<role>)/i;
  breakdown.role_assignment = role.test(prompt) ? 100 : 0;

  // T5 — XML structure
  const xml = /<(context|example|query|output_format|task|input|instructions|thinking)\b[^>]*>/i;
  breakdown.xml_structure = xml.test(prompt) ? 100 : 0;

  // T6 — Chain of thought
  const cot = /\b(piensa paso a paso|step by step|let's think|<thinking>|razonamiento|justifica|explica tu razonamiento|first.*then.*finally)/i;
  breakdown.chain_of_thought = cot.test(prompt) ? 100 : 0;

  // T7 — Context completeness (longitud + diversidad)
  const wordCount = prompt.split(/\s+/).filter(Boolean).length;
  let s7 = 0;
  if (wordCount >= 30) s7 += 40;
  if (wordCount >= 80) s7 += 30;
  if (/\b(contexto|background|información|datos|cliente|proyecto)\b/i.test(prompt)) s7 += 30;
  breakdown.context_complete = Math.min(100, s7);

  // Score ponderado
  let score = 0;
  for (const c of RUBRIC.criteria) {
    score += (breakdown[c.id] || 0) * (c.weight / 100);
  }
  score = Math.round(score);

  // Tips basados en el nivel
  const tips = generateTips(breakdown, score);

  return {
    score,
    level: levelFromScore(score),
    breakdown,
    tips,
    strategy: "code-based",
    grader_source: "Anthropic Course — Code-based grading module",
    grader_url: "https://anthropic.skilljar.com/claude-with-the-anthropic-api",
  };
}

/**
 * MODEL-BASED GRADER — usa Claude Haiku para evaluar.
 * Replica "Model based grading" del curso Anthropic.
 *
 * Solo se ejecuta si hay créditos. Devuelve null si falla.
 */
export async function modelBasedGrade(prompt, { apiKey, model = "claude-haiku-4-5", fetch: fetchFn = globalThis.fetch } = {}) {
  if (!apiKey) return null;

  const systemPrompt = `Eres un evaluador experto de prompts basado en el curso oficial de Anthropic Prompt Engineering.
Tu tarea: evaluar el prompt del usuario contra estos 7 criterios y darle un score de 0-100 a cada uno.

CRITERIOS (con pesos):
${RUBRIC.criteria.map(c => `- ${c.id} (${c.weight}%): ${c.description}\n  Fuente: ${c.source}`).join("\n")}

Devuelve EXCLUSIVAMENTE JSON válido con esta estructura:
{"clear_direct": 0-100, "output_format": 0-100, "examples": 0-100, "role_assignment": 0-100, "xml_structure": 0-100, "chain_of_thought": 0-100, "context_complete": 0-100, "rationale": "una frase explicando el score más bajo"}`;

  try {
    const r = await fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: `Evalúa este prompt:\n\n<prompt>\n${prompt}\n</prompt>` }],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const breakdown = JSON.parse(match[0]);
    let score = 0;
    for (const c of RUBRIC.criteria) {
      score += (Number(breakdown[c.id]) || 0) * (c.weight / 100);
    }
    return {
      score: Math.round(score),
      level: levelFromScore(Math.round(score)),
      breakdown,
      rationale: breakdown.rationale,
      strategy: "model-based",
      grader_model: model,
      grader_source: "Anthropic Course — Model-based grading module",
      grader_url: "https://anthropic.skilljar.com/claude-with-the-anthropic-api",
    };
  } catch (err) {
    return null;
  }
}

/**
 * Combined grade — replica el workflow oficial: code + model, promediados.
 * Si el model-based no está disponible, devuelve solo code-based marcado como `partial`.
 */
export async function gradePrompt(prompt, opts = {}) {
  const code = codeBasedGrade(prompt);
  const model = opts.useModel === false ? null : await modelBasedGrade(prompt, opts);

  if (!model) {
    return {
      ...code,
      partial: true,
      note: "Solo code-based grading (sin créditos Anthropic o desactivado).",
    };
  }

  const combined_score = Math.round((code.score + model.score) / 2);
  return {
    score: combined_score,
    level: levelFromScore(combined_score),
    code_based: code,
    model_based: model,
    strategy: "combined",
    workflow: "Anthropic course — Prompt evaluation workflow",
    workflow_url: "https://anthropic.skilljar.com/claude-with-the-anthropic-api",
  };
}

function levelFromScore(s) {
  if (s >= 85) return "expert";
  if (s >= 70) return "proficient";
  if (s >= 40) return "intermediate";
  return "novice";
}

function generateTips(breakdown, score) {
  const tips = [];
  for (const c of RUBRIC.criteria) {
    const s = breakdown[c.id] || 0;
    if (s < 50) {
      const goodSignals = c.evaluation?.good_signals || [];
      if (goodSignals.length) {
        tips.push({
          criterion: c.name,
          weight: c.weight,
          current_score: s,
          tip: goodSignals[0],
          source: c.source,
        });
      }
    }
  }
  // Limit to top 3 most impactful (highest weight, lowest score)
  tips.sort((a, b) => b.weight * (100 - b.current_score) - a.weight * (100 - a.current_score));
  return tips.slice(0, 3);
}
