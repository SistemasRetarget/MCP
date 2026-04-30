# Prompt Evaluation — basado en el curso oficial de Anthropic

> **Fuente directa:** [Building with the Anthropic API — Skilljar / Anthropic Academy](https://anthropic.skilljar.com/claude-with-the-anthropic-api), módulo **Prompt evaluation**.
> Submódulos seguidos: *A typical eval workflow · Generating test datasets · Running the eval · Model based grading · Code based grading*.

## Workflow oficial Anthropic (replicado aquí)

```
1. Generate test dataset    → prompt-eval/datasets/<task>.jsonl
2. Run the eval             → ejecuta prompt + evalúa con ambas estrategias
3. Code-based grading       → reglas en JS (regex, keywords, length, format)
4. Model-based grading      → Claude Haiku evalúa output contra rubric
5. Report                   → score combinado + tips de mejora
6. Iterate                  → mejorar prompt → repetir → score sube
```

## Score final

```
final_score = 0.5 * code_based_score + 0.5 * model_based_score
```

Si no hay créditos de Anthropic → fallback a `code_based_score` solamente, marcado como `partial`.

## Niveles (basados en Anthropic PE Course)

| Score | Nivel | Acción sugerida |
|---|---|---|
| 0–39 | Novice | Usar `improvement_tips.novice_to_intermediate` del rubric |
| 40–69 | Intermediate | Tips de `intermediate_to_proficient` |
| 70–84 | Proficient | Tips de `proficient_to_expert` |
| 85–100 | Expert | Mantener práctica, contribuir ejemplos |

## Citas académicas que respaldan cada criterio

- **Few-shot:** Brown, T. et al. *Language Models are Few-Shot Learners*. NeurIPS 2020. https://arxiv.org/abs/2005.14165
- **Chain-of-Thought:** Wei, J. et al. *Chain-of-Thought Prompting Elicits Reasoning in LLMs*. NeurIPS 2022. https://arxiv.org/abs/2201.11903
- **Constitutional AI:** Bai, Y. et al. (Anthropic). arXiv:2212.08073. https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback
- **Eval workflows:** Anthropic Skilljar Course (oficial) — https://anthropic.skilljar.com/claude-with-the-anthropic-api
