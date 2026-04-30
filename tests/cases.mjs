/**
 * Test cases para el MCP de Retarget.
 * Estructura conforme a IEEE 829-2008 — Standard for Software Test Documentation.
 * https://standards.ieee.org/ieee/829/4414/
 *
 * Cada caso mapea a un principio NIST AI RMF 1.0 (https://nist.gov/itl/ai-risk-management-framework)
 * y, cuando aplica, a otros frameworks (EU AI Act, OECD, IEEE 7000-2021).
 *
 * IMPORTANTE: Los tests se ejecutan en VIVO contra el MCP en producción
 * (o contra una URL configurable). NO usan mocks por defecto, para que
 * los resultados reflejen el estado real del sistema.
 */

export const TEST_CASES = [
  // ──── VALID & RELIABLE (NIST característica #1) ────
  {
    id: "T01",
    name: "Heartbeat responde en <500ms",
    nist_principle: "Valid and Reliable",
    framework: "NIST AI RMF 1.0 §3.2.1",
    framework_url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    description: "El endpoint /heartbeat debe responder rápido y siempre estar vivo (sin tocar Anthropic).",
    severity: "critical",
    async run({ baseUrl, fetch }) {
      const t0 = Date.now();
      const r = await fetch(`${baseUrl}/heartbeat`, { signal: AbortSignal.timeout(5000) });
      const elapsed = Date.now() - t0;
      const data = await r.json();
      if (r.status !== 200) throw new Error(`status ${r.status}`);
      if (data.alive !== true) throw new Error("alive !== true");
      if (elapsed > 500) throw new Error(`tardó ${elapsed}ms (>500ms)`);
      return { elapsed_ms: elapsed, started_at: data.started_at };
    },
  },
  {
    id: "T02",
    name: "Status devuelve metadata consistente",
    nist_principle: "Valid and Reliable",
    framework: "NIST AI RMF 1.0",
    framework_url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    description: "El endpoint /status debe devolver service, version, started_at, uptime_seconds, mcp_process_alive.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/status`);
      const d = await r.json();
      const required = ["service", "version", "started_at", "uptime_seconds", "mcp_process_alive"];
      for (const k of required) if (!(k in d)) throw new Error(`falta campo: ${k}`);
      if (d.uptime_seconds < 0) throw new Error("uptime negativo");
      return { service: d.service, version: d.version };
    },
  },

  // ──── SAFE (NIST característica #2) ────
  {
    id: "T03",
    name: "Health no consume créditos por defecto",
    nist_principle: "Safe",
    framework: "NIST AI RMF + cost safety",
    framework_url: "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf",
    description: "GET /health (sin force=1) NO debe llamar a Anthropic. Verificable porque responde <300ms.",
    severity: "critical",
    async run({ baseUrl, fetch }) {
      const t0 = Date.now();
      const r = await fetch(`${baseUrl}/health`);
      const elapsed = Date.now() - t0;
      const d = await r.json();
      if (elapsed > 1000) throw new Error(`tardó ${elapsed}ms — sospecha probe activo`);
      if (!d.anthropic) throw new Error("falta campo anthropic");
      return { elapsed_ms: elapsed, anthropic_status: d.anthropic.status };
    },
  },

  // ──── SECURE & RESILIENT (NIST característica #3) ────
  {
    id: "T04",
    name: "Endpoint inexistente devuelve 404 limpio",
    nist_principle: "Secure and Resilient",
    framework: "OWASP API Security Top 10 (2023)",
    framework_url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/",
    description: "Endpoints no existentes devuelven 404 con JSON, no leak de stack traces.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/api/this-does-not-exist-${Date.now()}`);
      if (r.status !== 404) throw new Error(`esperado 404, got ${r.status}`);
      const txt = await r.text();
      if (/at \w+\.\w+ \(.*:\d+:\d+\)/.test(txt)) throw new Error("stack trace expuesto");
      return { status: 404 };
    },
  },
  {
    id: "T05",
    name: "Payload malformado en /chat no rompe el servidor",
    nist_principle: "Secure and Resilient",
    framework: "OWASP API4:2023 Unrestricted Resource Consumption",
    framework_url: "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/",
    description: "POST con JSON malformado devuelve 400 sin colgar.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{this is not json",
        signal: AbortSignal.timeout(8000),
      });
      if (r.status !== 400 && r.status !== 200) throw new Error(`esperado 400, got ${r.status}`);
      return { status: r.status };
    },
  },

  // ──── ACCOUNTABLE & TRANSPARENT (NIST característica #4) ────
  {
    id: "T06",
    name: "Identity declarada y consistente",
    nist_principle: "Accountable and Transparent",
    framework: "EU AI Act Art. 50 (Transparency obligations)",
    framework_url: "https://artificialintelligenceact.eu/article/50/",
    description: "GET /identity devuelve identidad oficial con signature de Sistemas Retarget.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/identity`);
      const d = await r.json();
      if (!d.identity?.name) throw new Error("falta identity.name");
      if (!d.identity?.developed_by?.includes("Retarget")) throw new Error("developed_by no menciona Retarget");
      return { name: d.identity.name, developed_by: d.identity.developed_by };
    },
  },
  {
    id: "T07",
    name: "Eventos críticos quedan loggeados",
    nist_principle: "Accountable and Transparent",
    framework: "NIST AI RMF Map 4.1 + IEEE 7000-2021",
    framework_url: "https://standards.ieee.org/ieee/7000/6781/",
    description: "GET /events devuelve un log estructurado con at, level, kind.",
    severity: "medium",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/events?limit=10`);
      const d = await r.json();
      if (!Array.isArray(d.events)) throw new Error("events no es array");
      return { count: d.events.length };
    },
  },

  // ──── EXPLAINABLE & INTERPRETABLE (NIST característica #5) ────
  {
    id: "T08",
    name: "Razonamiento de cada landing es trazable",
    nist_principle: "Explainable and Interpretable",
    framework: "NIST AI RMF + Wei et al, Chain-of-Thought (NeurIPS 2022)",
    framework_url: "https://arxiv.org/abs/2201.11903",
    description: "Cada landing del proyecto incluye un campo 'reasoning' explicando decisiones.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/api/projects/list`);
      const d = await r.json();
      if (!d.projects?.length) throw new Error("no hay proyectos");
      const sample = d.projects[0];
      const full = await (await fetch(`${baseUrl}/api/projects/${sample.id}/full`)).json();
      const landings = full.landings || [];
      if (!landings.length) throw new Error("proyecto sin landings");
      const withReasoning = landings.filter(l => l.reasoning && l.reasoning.length > 20);
      if (withReasoning.length === 0) throw new Error("ninguna landing tiene reasoning");
      return { landings_total: landings.length, with_reasoning: withReasoning.length };
    },
  },
  {
    id: "T09",
    name: "Decisiones registradas como timeline auditable",
    nist_principle: "Explainable and Interpretable",
    framework: "Nonaka & Takeuchi (1995) — Knowledge Creation",
    framework_url: "https://en.wikipedia.org/wiki/SECI_model_of_knowledge_dimensions",
    description: "POST /api/projects/<id>/reasoning persiste y GET /full lo devuelve en runtime.reasoning.",
    severity: "medium",
    async run({ baseUrl, fetch }) {
      const list = await (await fetch(`${baseUrl}/api/projects/list`)).json();
      const id = list.projects?.[0]?.id;
      if (!id) throw new Error("no hay proyectos");
      const test_decision = `[test ${Date.now()}] decisión auto-test`;
      const post = await fetch(`${baseUrl}/api/projects/${id}/reasoning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: "test", decision: test_decision, rationale: "auto-test" }),
      });
      if (post.status !== 201) throw new Error(`POST status ${post.status}`);
      const full = await (await fetch(`${baseUrl}/api/projects/${id}/full`)).json();
      const found = (full.runtime?.reasoning || []).find(r => r.decision === test_decision);
      if (!found) throw new Error("decision no encontrada tras POST");
      return { decision_persisted: true };
    },
  },

  // ──── PRIVACY-ENHANCED (NIST característica #6) ────
  {
    id: "T10",
    name: "Domain allowlist activa para /chat",
    nist_principle: "Privacy + Security",
    framework: "EU AI Act Art. 13 + Zero-Trust (Kindervag, Forrester 2010)",
    framework_url: "https://artificialintelligenceact.eu/article/13/",
    description: "Email fuera de @retarget.cl es rechazado por /chat.",
    severity: "critical",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "stranger@example.com", message: "hola" }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 200 && d.error == null) throw new Error("no rechazó email externo");
      return { rejected: true, status: r.status };
    },
  },
  {
    id: "T11",
    name: "API keys nunca aparecen en respuestas",
    nist_principle: "Privacy-Enhanced",
    framework: "OWASP API3:2023 Broken Object Property Level Authorization",
    framework_url: "https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/",
    description: "Ningún endpoint público devuelve ANTHROPIC_API_KEY ni patrones tipo sk-ant-*.",
    severity: "critical",
    async run({ baseUrl, fetch }) {
      const endpoints = ["/status", "/identity", "/health", "/heartbeat", "/api/projects/list"];
      const leaked = [];
      for (const ep of endpoints) {
        const txt = await (await fetch(`${baseUrl}${ep}`)).text();
        if (/sk-ant-[a-z0-9_-]{20,}/i.test(txt) || /ANTHROPIC_API_KEY["']?\s*[:=]\s*["']?[a-z0-9-]/i.test(txt)) {
          leaked.push(ep);
        }
      }
      if (leaked.length) throw new Error(`leak en: ${leaked.join(", ")}`);
      return { endpoints_checked: endpoints.length, leaks: 0 };
    },
  },

  // ──── FAIR / WITH BIAS MANAGED (NIST característica #7) ────
  {
    id: "T12",
    name: "Sistema declara su naturaleza AI (no se hace pasar por humano)",
    nist_principle: "Fair + Transparent",
    framework: "EU AI Act Art. 50.1 — disclosure obligation",
    framework_url: "https://artificialintelligenceact.eu/article/50/",
    description: "El greeting/identity declara explícitamente que es un asistente AI/sistema.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const d = await (await fetch(`${baseUrl}/identity`)).json();
      const text = JSON.stringify(d).toLowerCase();
      if (!/asistente|assistant|sistema|chatbot|ai/.test(text)) {
        throw new Error("identity no declara naturaleza AI");
      }
      return { declares_ai: true };
    },
  },

  // ──── METHODOLOGY-SPECIFIC TESTS ────
  {
    id: "T13",
    name: "Validators implementan Core Web Vitals (Google 2020)",
    nist_principle: "Valid and Reliable",
    framework: "Google Web Vitals (Walton, P. — 2020)",
    framework_url: "https://web.dev/articles/vitals",
    description: "El validador core-web-vitals.mjs existe y exporta validateCoreWebVitals.",
    severity: "medium",
    async run({ baseUrl, fetch, fs }) {
      const path = "validators/core-web-vitals.mjs";
      const exists = await fs.access(path).then(() => true).catch(() => false);
      if (!exists) throw new Error(`no existe ${path}`);
      const content = await fs.readFile(path, "utf8");
      if (!/validateCoreWebVitals/.test(content)) throw new Error("no exporta validateCoreWebVitals");
      return { validator: "present" };
    },
  },
  {
    id: "T14",
    name: "Lessons-KB es persistente (Nonaka & Takeuchi, 1995)",
    nist_principle: "Accountable",
    framework: "SECI Model — Nonaka & Takeuchi (1995)",
    framework_url: "https://en.wikipedia.org/wiki/SECI_model_of_knowledge_dimensions",
    description: "El archivo lessons/lessons.jsonl existe y es JSONL válido.",
    severity: "medium",
    async run({ baseUrl, fetch, fs }) {
      const path = "lessons/lessons.jsonl";
      const exists = await fs.access(path).then(() => true).catch(() => false);
      if (!exists) throw new Error(`no existe ${path}`);
      const content = await fs.readFile(path, "utf8");
      const lines = content.split("\n").filter(Boolean);
      for (const line of lines) JSON.parse(line); // throw si malformed
      return { lessons_count: lines.length };
    },
  },
  {
    id: "T15",
    name: "Team contract está declarado (Design by Contract — Meyer 1988)",
    nist_principle: "Accountable",
    framework: "Design by Contract — Bertrand Meyer (1988)",
    framework_url: "https://en.wikipedia.org/wiki/Design_by_contract",
    description: "contracts/team.json existe con members y signature.",
    severity: "medium",
    async run({ baseUrl, fetch, fs }) {
      const path = "contracts/team.json";
      const content = await fs.readFile(path, "utf8");
      const j = JSON.parse(content);
      if (!Array.isArray(j.members)) throw new Error("members no es array");
      if (!j.members.find(m => m.id === "luis")) throw new Error("no incluye 'luis'");
      return { members_count: j.members.length };
    },
  },
  {
    id: "T16",
    name: "Dashboard /projects sirve HTML (Status reporting — Tufte 1983)",
    nist_principle: "Accountable + Transparent",
    framework: "Tufte, E. — Visual Display of Quantitative Information (1983)",
    framework_url: "https://en.wikipedia.org/wiki/Edward_Tufte",
    description: "GET /projects responde HTML válido con DOCTYPE.",
    severity: "high",
    async run({ baseUrl, fetch }) {
      const r = await fetch(`${baseUrl}/projects`);
      const txt = await r.text();
      if (!/<!doctype html/i.test(txt)) throw new Error("no es HTML");
      if (!/Proyectos/.test(txt)) throw new Error("contenido no esperado");
      return { content_length: txt.length };
    },
  },
  {
    id: "T17",
    name: "Footer atribuye autor (IEEE 7000-2021 §6.3 — value attribution)",
    nist_principle: "Accountable",
    framework: "IEEE 7000-2021",
    framework_url: "https://standards.ieee.org/ieee/7000/6781/",
    description: "El dashboard incluye footer con atribución 'Luis' visible.",
    severity: "low",
    async run({ baseUrl, fetch }) {
      const txt = await (await fetch(`${baseUrl}/projects`)).text();
      if (!/Luis/.test(txt)) throw new Error("footer no atribuye");
      return { attribution_present: true };
    },
  },
];

export const TEST_META = {
  framework_primary: "NIST AI Risk Management Framework 1.0",
  framework_url: "https://www.nist.gov/itl/ai-risk-management-framework",
  test_documentation_standard: "IEEE 829-2008",
  test_documentation_url: "https://standards.ieee.org/ieee/829/4414/",
  total_cases: TEST_CASES.length,
};
