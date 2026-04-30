# Responsible AI — Frameworks aplicados al MCP de Retarget

> **Filosofía:** este sistema no inventa principios éticos ni de calidad. Aplica frameworks reconocidos internacionalmente, citados con su autor/organismo, año y URL oficial. Cualquier escéptico puede ir directamente a la fuente.

---

## Frameworks aplicados (ordenados por relevancia)

### 1. NIST AI Risk Management Framework (AI RMF 1.0)

- **Organismo:** *National Institute of Standards and Technology* (USA — Departamento de Comercio).
- **Publicado:** Enero 2023.
- **URL oficial:** https://www.nist.gov/itl/ai-risk-management-framework
- **Documento:** https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
- **Wikipedia:** https://en.wikipedia.org/wiki/National_Institute_of_Standards_and_Technology
- **Las 7 características de un sistema AI confiable según NIST:**
  1. **Valid and Reliable** — el sistema funciona como se espera, consistentemente.
  2. **Safe** — no produce daño físico, psicológico, financiero o ambiental.
  3. **Secure and Resilient** — resiste ataques, recupera tras fallos.
  4. **Accountable and Transparent** — alguien responde por las decisiones; las decisiones son trazables.
  5. **Explainable and Interpretable** — un humano puede entender por qué el sistema decidió X.
  6. **Privacy-Enhanced** — protege información personal.
  7. **Fair — with Harmful Bias Managed** — sesgos identificados y mitigados.

---

### 2. EU AI Act (Reglamento de IA de la Unión Europea)

- **Organismo:** Comisión Europea + Parlamento Europeo + Consejo.
- **Publicado:** Texto final aprobado Marzo 2024, en vigor Agosto 2024.
- **URL oficial:** https://artificialintelligenceact.eu/
- **Documento Oficial Journal:** https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202401689
- **Wikipedia:** https://en.wikipedia.org/wiki/Artificial_Intelligence_Act
- **Aplicación en MCP:** clasificamos el sistema como `Limited Risk` (chatbot con disclosure) — debemos identificarnos como AI cuando un humano interactúa.

---

### 3. OECD AI Principles

- **Organismo:** *Organisation for Economic Co-operation and Development*.
- **Publicado:** Mayo 2019, actualizado Mayo 2024.
- **URL oficial:** https://oecd.ai/en/ai-principles
- **Wikipedia:** https://en.wikipedia.org/wiki/OECD_AI_Principles
- **Los 5 principios OECD:**
  1. Inclusive growth, sustainable development and well-being.
  2. Human rights and democratic values, including fairness and privacy.
  3. Transparency and explainability.
  4. Robustness, security and safety.
  5. Accountability.

---

### 4. IEEE 7000-2021 — Model Process for Addressing Ethical Concerns

- **Organismo:** *Institute of Electrical and Electronics Engineers*.
- **Publicado:** Septiembre 2021.
- **URL oficial:** https://standards.ieee.org/ieee/7000/6781/
- **Wikipedia:** https://en.wikipedia.org/wiki/IEEE
- **Aplicación en MCP:** stakeholder elicitation y values-based engineering durante el design.

---

### 5. Asilomar AI Principles

- **Organismo:** *Future of Life Institute* (firmado por Hawking, Musk, Bengio, Hassabis, etc.).
- **Publicado:** Enero 2017 (conferencia Asilomar, California).
- **URL oficial:** https://futureoflife.org/open-letter/ai-principles/
- **Wikipedia:** https://en.wikipedia.org/wiki/Asilomar_Conference_on_Beneficial_AI
- **23 principios** organizados en: Research Issues / Ethics & Values / Longer-term Issues.

---

### 6. Microsoft Responsible AI Standard v2

- **Organismo:** Microsoft Corporation.
- **Publicado:** Junio 2022.
- **URL oficial:** https://www.microsoft.com/en-us/ai/responsible-ai
- **Documento:** https://blogs.microsoft.com/wp-content/uploads/prod/sites/5/2022/06/Microsoft-Responsible-AI-Standard-v2-General-Requirements-3.pdf
- **6 principios:** Fairness · Reliability & Safety · Privacy & Security · Inclusiveness · Transparency · Accountability.

---

### 7. Google Responsible AI Practices

- **Organismo:** Google / DeepMind.
- **Publicado:** Junio 2018, actualizado anualmente.
- **URL oficial:** https://ai.google/responsibility/principles/
- **Aplicación en MCP:** datasheets para datasets, model cards para modelos.

---

### 8. Anthropic Acceptable Use Policy + Usage Policies

- **Organismo:** Anthropic PBC.
- **URL oficial:** https://www.anthropic.com/legal/aup
- **Constitutional AI paper:** Bai, Y. et al. arXiv:2212.08073 (Dec 2022). https://arxiv.org/abs/2212.08073
- **Wikipedia:** https://en.wikipedia.org/wiki/Anthropic
- **Aplicación en MCP:** todo lo que Claude responde respeta la Constitution embebida en el modelo.

---

## Estándares de testing aplicados

### IEEE 829-2008 — Standard for Software Test Documentation

- **Organismo:** IEEE.
- **Publicado:** 2008 (revisión de IEEE 829-1998).
- **URL oficial:** https://standards.ieee.org/ieee/829/4414/
- **Wikipedia:** https://en.wikipedia.org/wiki/Software_test_documentation
- **Aplicación en MCP:** estructura de cada test case con `id`, `description`, `precondition`, `step`, `expected`, `actual`, `verdict`.

### Test-Driven Development (TDD)

- **Autor:** Kent Beck.
- **Libro:** *Test-Driven Development: By Example*. Addison-Wesley, 2002. ISBN 978-0321146533.
- **URL Wikipedia:** https://en.wikipedia.org/wiki/Test-driven_development
- **URL del autor:** https://www.kentbeck.com/

### Behavior-Driven Development (BDD)

- **Autor:** Dan North.
- **Paper:** "Introducing BDD". *Better Software*, March 2006. https://dannorth.net/introducing-bdd/
- **Wikipedia:** https://en.wikipedia.org/wiki/Behavior-driven_development

---

## Mapeo: cada categoría de test del MCP → principio NIST AI RMF

| Categoría de test | Principio NIST | Frameworks adicionales |
|---|---|---|
| Health / Heartbeat / Uptime | Reliable | OECD #4 (Robustness) |
| Auth / Domain allowlist | Secure | EU AI Act Art. 13 |
| Identity / Greeting consistente | Transparent | OECD #3 + EU AI Act Art. 50 |
| Validators (CWV, SEO, A11y) | Valid | Microsoft RA Standard |
| Lessons KB / Razonamiento trazable | Accountable + Explainable | NIST + Asilomar #6 |
| Feedback / Errors collection | Accountable | NIST + Microsoft RA |
| No exposure de secrets | Privacy-Enhanced | EU AI Act + GDPR |
| Rate limiting / DoS resistance | Resilient | NIST + OECD #4 |
| No discriminación por dominio | Fair | NIST + OECD #2 |

---

**Última actualización:** 2026-04-29
**Mantenido por:** Sistemas Retarget
**Uso de las fuentes:** este documento solo cita; las metodologías son propiedad de sus respectivos autores/organismos.
