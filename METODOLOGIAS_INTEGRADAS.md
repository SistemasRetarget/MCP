# Metodologías integradas en el MCP de Retarget

> Este sistema **no inventa metodologías**. Integra prácticas probadas de la industria, citadas con su autor, año y fuente oficial. Cada decisión de arquitectura está respaldada por trabajo previo de la comunidad técnica.

---

## 1. Mejora continua — **PDCA (Plan–Do–Check–Act)**

- **Autor:** Walter A. Shewhart (1939); popularizado por **W. Edwards Deming** (1950).
- **Fuente:** Deming, W. E. *Out of the Crisis*. MIT Press, 1986.
- **Cómo lo usa el MCP:** ciclo de sesión → trabajar → reportar → revisar → aplicar lecciones (`lessons.jsonl`).
- **Citado en repo:** `@/Users/spam11/github/MCP/CLAUDE.md:43-50` (cómo arranca/termina una sesión).

---

## 2. Knowledge Management — **SECI / Lessons Learned**

- **Autores:** Ikujiro Nonaka & Hirotaka Takeuchi.
- **Fuente:** Nonaka, I. & Takeuchi, H. *The Knowledge-Creating Company*. Oxford University Press, 1995.
- **Cómo lo usa el MCP:** cada bug/decisión queda en `lessons-kb` antes de reintentar. Tool `mcp0_lessons-search` y `mcp0_lessons-log`.
- **Citado en repo:** `@/Users/spam11/github/MCP/lessons/lessons.jsonl` (storage).

---

## 3. Diseño por Contratos — **Design by Contract (DbC)**

- **Autor:** Bertrand Meyer.
- **Fuente:** Meyer, B. "Applying Design by Contract". *IEEE Computer*, 1992. Y *Object-Oriented Software Construction*, Prentice Hall, 1988.
- **Cómo lo usa el MCP:** cada workflow declara `Input/Output contracts` antes de ejecutar. Sin contrato cumplido, no se progresa.
- **Citado en repo:** `@/Users/spam11/github/MCP/contracts/team.json:1-10`, y workflows con `input_contract` / `output_contract`.

---

## 4. Multi-Agent Orchestration — **Society of Mind**

- **Autor inicial:** Marvin Minsky.
- **Fuente:** Minsky, M. *The Society of Mind*. Simon & Schuster, 1986.
- **Refinamiento moderno:** Anthropic. *Building Effective Agents*. Dec 2024. https://www.anthropic.com/research/building-effective-agents
- **Cómo lo usa el MCP:** 9 subagentes especializados (`reconnaissance`, `designer`, `content-writer`, etc.) coordinados por un supervisor.
- **Citado en repo:** `@/Users/spam11/github/MCP/mcp-subagents-config.json:64-91` (definición de subagentes).

---

## 5. Cadena de razonamiento — **Chain-of-Thought (CoT) Prompting**

- **Autores:** Jason Wei, Xuezhi Wang, et al. (Google Brain).
- **Fuente:** Wei, J. et al. "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models". *NeurIPS 2022*. arXiv:2201.11903.
- **Cómo lo usa el MCP:** los subagentes usan `reasoning_trace` como output requerido en el research protocol.
- **Citado en repo:** `@/Users/spam11/github/MCP/mcp-subagents-config.json:38-46`.

---

## 6. Constitutional AI / Self-correction

- **Autores:** Yuntao Bai et al. (Anthropic).
- **Fuente:** Bai, Y. et al. "Constitutional AI: Harmlessness from AI Feedback". arXiv:2212.08073, Dec 2022. https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
- **Cómo lo usa el MCP:** reglas fijas que Claude debe respetar siempre (CLAUDE.md), independiente de lo que el usuario pida.
- **Citado en repo:** `@/Users/spam11/github/MCP/CLAUDE.md:31-39` ("Lo que NO haces") y `@/Users/spam11/github/MCP/CLAUDE.md:77-83` ("Reglas duras").

---

## 7. Prompt Engineering — **Anthropic Prompt Engineering Course**

- **Autor:** Anthropic (curso oficial 2024).
- **Fuente:** *Anthropic Prompt Engineering Interactive Tutorial*. https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering · GitHub: https://github.com/anthropics/courses
- **Técnicas clave (citadas):**
  1. **Be clear and direct** — instrucciones específicas y orden lógico.
  2. **Use examples (few-shot)** — Brown, T. et al. "Language Models are Few-Shot Learners" (GPT-3). NeurIPS 2020.
  3. **Give Claude a role (system prompt)** — definir persona experta.
  4. **Use XML tags** — separar contexto, ejemplos, output esperado.
  5. **Chain prompts** — descomponer tareas complejas.
  6. **Let Claude think (`<thinking>`)** — antes de responder.
- **Cómo lo usa el MCP:** será el **rubric oficial** del sistema de score visual de prompt engineering por usuario (en construcción).

---

## 8. Test-Driven QA — **Visual Regression Testing**

- **Autores conceptuales:** Kent Beck (TDD original, *Test-Driven Development: By Example*, Addison-Wesley, 2002).
- **Visual diff popularizado por:** Google Chrome team, BackstopJS (Garris Shipon, 2014), Percy.io.
- **Cómo lo usa el MCP:** tools `screenshot` + `visual-diff` con tolerance configurable. Evidencia en `evidence/<project>/<view>/`.
- **Citado en repo:** `@/Users/spam11/github/MCP/tools/visual-diff.mjs` y `@/Users/spam11/github/MCP/mcp-subagents-config.json:38-42`.

---

## 9. Build–Measure–Learn — **Lean Startup**

- **Autor:** Eric Ries.
- **Fuente:** Ries, E. *The Lean Startup*. Crown Business, 2011.
- **Cómo lo usa el MCP:** ciclo de iteración corta sobre cada landing → desplegar a QA → medir (visual diff + Core Web Vitals) → ajustar.
- **Aplica en:** workflow `clone-site-complete` (6 pasos) y `iterate-section` (4 pasos) descritos en arquitectura.

---

## 10. Performance Standards — **Core Web Vitals**

- **Autor:** Google Chrome team (2020).
- **Fuente:** *Web Vitals*. https://web.dev/articles/vitals · Walton, P. (Tech Lead).
- **Métricas usadas:** LCP (Largest Contentful Paint), INP (Interaction to Next Paint, reemplaza FID desde Mar 2024), CLS (Cumulative Layout Shift).
- **Cómo lo usa el MCP:** validador automático.
- **Citado en repo:** `@/Users/spam11/github/MCP/validators/core-web-vitals.mjs`.

---

## 11. Mobile-First Design

- **Autor:** Luke Wroblewski.
- **Fuente:** Wroblewski, L. *Mobile First*. A Book Apart, 2011.
- **Cómo lo usa el MCP:** validador automático verifica viewport meta, breakpoints, touch targets.
- **Citado en repo:** `@/Users/spam11/github/MCP/validators/mobile-first.mjs`.

---

## 12. SEO Técnico — **Search Engine Optimization Standards**

- **Autores referencia:** Google Search Central · Aleyda Solis (consultora referente). https://developers.google.com/search/docs
- **Cómo lo usa el MCP:** validador verifica meta tags, sitemap.xml, robots.txt, canonical, JSON-LD structured data.
- **Citado en repo:** `@/Users/spam11/github/MCP/validators/seo-technical.mjs`.

---

## 13. Compliance — **Google Ads Policies**

- **Autor:** Google Ads (políticas oficiales). https://support.google.com/adspolicy/answer/6008942
- **Cómo lo usa el MCP:** valida landing pages contra políticas (claims engañosos, datos sensibles, etc.).
- **Citado en repo:** `@/Users/spam11/github/MCP/validators/google-ads-policies.mjs`.

---

## 14. Zero-Trust Security — **Domain Allowlist + RBAC**

- **Autor:** John Kindervag (Forrester Research, 2010).
- **Fuente:** Kindervag, J. *No More Chewy Centers: Introducing The Zero Trust Model of Information Security*. Forrester, 2010. https://www.forrester.com/report/No-More-Chewy-Centers-Introducing-The-Zero-Trust-Model-Of-Information-Security/RES56682
- **RBAC:** NIST SP 800-162 (Ferraiolo, Kuhn).
- **Cómo lo usa el MCP:** allowlist `@retarget.cl` y `team_assignments` por rol.
- **Citado en repo:** `@/Users/spam11/github/MCP/mcp-subagents-config.json:19-25`.

---

## 15. Workflow Reporting — **Status Reporting Discipline**

- **Inspiración:** Edward Tufte (visualización de información). *The Visual Display of Quantitative Information*, 1983.
- **Aplicación moderna:** Atlassian, Linear, Stripe (status pages).
- **Cómo lo usa el MCP:** dashboard `/projects` con cards visuales + tabs (Overview / Landings / Visual / Recursos / Equipo / Razonamiento / Feedback / Errores / Deploy).

---

## 16. Communicating Sequential Processes (CSP) — para workflows con I/O

- **Autor:** C. A. R. (Tony) Hoare.
- **Fuente:** Hoare, C. A. R. "Communicating Sequential Processes". *Communications of the ACM* 21(8), 1978. https://dl.acm.org/doi/10.1145/359576.359585
- **Cómo lo usa el MCP:** workflows como pipelines con input/output explícitos por etapa.

---

## Tabla resumen — qué metodología aplica a cada rol

| Rol del MCP | Metodologías que aplica |
|---|---|
| **Reconnaissance** | Research Protocol con evidencia (método científico) + few-shot prompting (Brown et al, 2020) |
| **Designer** | Mobile-First (Wroblewski, 2011) + Visual Regression (Beck, 2002) |
| **Content-Writer** | Brand voice + SEO (Google Search Central) + Constitutional AI (Bai et al, 2022) |
| **Layout-Builder** | Design by Contract (Meyer, 1988) + CWV (Google, 2020) |
| **QA-Validator** | TDD (Beck, 2002) + Visual Diff |
| **Deployment** | PDCA (Deming) + Zero-Trust (Kindervag, 2010) |
| **Doc-Reporter** | Status Reporting (Tufte, 1983) |
| **SEO-Auditor** | Google Search Central (oficial) |
| **Supervisor** | Society of Mind (Minsky, 1986) + Anthropic Building Effective Agents (2024) |

---

## Próximo paso — Sistema de Score de Prompt Engineering por usuario

Vamos a integrar el rubric oficial de **Anthropic Prompt Engineering Course** como sistema de scoring visible para cada usuario. Cada chat se evalúa contra:

| Criterio | Peso | Fuente |
|---|---|---|
| Clear and direct instructions | 20% | Anthropic PE Course, módulo 2 |
| Specific output format | 15% | Anthropic PE Course, módulo 7 |
| Examples / few-shot | 15% | Brown et al, GPT-3 paper, 2020 |
| Role assignment | 10% | Anthropic PE Course, módulo 4 |
| XML structure | 10% | Anthropic best practices |
| Chain of thought | 15% | Wei et al, NeurIPS 2022 |
| Context completeness | 15% | Anthropic PE Course, módulo 1 |

Score 0-100 visible por usuario, con tips de mejora basados en el rubric oficial.

---

**Última actualización:** 2026-04-29
**Mantenido por:** Sistemas Retarget — Vista desarrollada por Luis con ❤
**Licencia de las referencias citadas:** las fuentes son de sus respectivos autores; este documento solo cita y aplica.
