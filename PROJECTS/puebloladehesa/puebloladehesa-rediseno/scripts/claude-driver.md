# Claude Auto-Driver — Pueblo La Dehesa

Este prompt es el "estado mental" del loop autónomo. Pegar como mensaje a Claude para que itere solo hasta terminar el sitio.

---

## Loop instructions (autonomous)

You are the autonomous QA driver for the Pueblo La Dehesa site rebuild. Your job is to make the QA at `https://puebloladehesa-web-production.up.railway.app` match the structure of `https://puebloladehesa.cl` section-by-section, **without asking the user for confirmation between iterations**.

State of the world lives in `.qa-state.json`. The orchestrator script `scripts/auto-build-site.sh` does the captures, diffs, and status updates. Your job is the code-fix step when status becomes `NEEDS_FIX`.

### Each cycle, do this:

1. **Run** `bash scripts/auto-build-site.sh`. Read its output and the new `.qa-state.json`.

2. **If exit code 0**: every section is `DONE` or `BLOCKED`. STOP and report final summary. Do NOT schedule another wakeup.

3. **If exit code 2**: one section flipped to `NEEDS_FIX`. Look at:
   - `.qa-state.json` → `.current_section`, last_diff, notes
   - `~/Documents/workspace-mcp-global/evidence/puebloladehesa-rediseno/<view>/{reference,actual,diff}.png`
   
   Open both images with the Read tool, identify ONE concrete structural gap (header color, image dimensions, copy text, layout grid, etc.), apply a **targeted code change**, run `tsc --noEmit` if you touched TS, then `git add -A && git commit -m "fix(<section>): ..." && git push origin main`. Update `.qa-state.json` notes for that section briefly.
   
4. **Schedule next iteration**: call `ScheduleWakeup` with `delaySeconds=210` (3.5 min for build) and `prompt=<<autonomous-loop-dynamic>>` — this re-fires this exact driver.

### Hard rules

- **Never** ask the user a question.
- **Never** loop more than `max_iterations_per_section` times on the same section (script enforces this — it'll mark BLOCKED and move on).
- **Never** make a change unrelated to the current section.
- **Always** push after committing — Railway auto-deploys on `main`.
- **Always** validate logo+text visibility (white over hero, dark over scrolled cream) when touching header.
- **Pragmatic > pixel-perfect**: if structure cumple (logo visible, nav legible, layout correcto), accept the diff and move on.

### Sections in order

1. ~~header~~ ✅
2. ~~hero~~ ✅
3. ~~intro~~ ✅
4. **casas-grid** ← current
5. experiencias
6. testimonios (only in QA — keep)
7. faq (only in QA — keep)
8. footer

### When all DONE

Write a final summary message:
- Total commits applied
- Sections completed
- Sections BLOCKED (with reason)
- QA URL final
- Next manual review needed

Stop. Do not wakeup again.
