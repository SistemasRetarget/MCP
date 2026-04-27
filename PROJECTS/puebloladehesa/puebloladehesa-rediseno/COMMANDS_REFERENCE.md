# Complete Commands Reference

## Single Entry Point

Use **ONE command** for all automation:

```bash
./scripts/run.sh [command]
```

---

## Commands & Workflow

### 1. VALIDATE (Default)
```bash
./scripts/run.sh validate
```
- Captures production + QA screenshots
- Calculates visual diffs  
- Iterates until sections DONE
- Reports progress
- Updates .qa-state.json

**Authorizations Used:**
✓ Screenshot capture
✓ Visual diff computation
✓ JSON file updates

---

### 2. VALIDATE SECTION
```bash
./scripts/run.sh section header
./scripts/run.sh section casas-grid
./scripts/run.sh section footer
```
- Validates single section only
- Faster than full validation
- Useful for targeted fixes

**Authorizations Used:**
✓ Screenshot capture (one section)
✓ Visual diff for section
✓ State update

---

### 3. DETECT ISSUES
```bash
./scripts/run.sh fix
```
Scans for:
- Dropdown text visibility
- Z-index stacking problems
- Broken image references
- Color contrast issues

**Authorizations Used:**
✓ Code scanning
✓ File system access
✓ Reporting only (no changes)

---

### 4. AUTO-FIX ISSUES
```bash
./scripts/run.sh fix --apply
```
Automatically fixes:
- Adds `text-brand-ink` to dropdown items
- Adds `z-50` z-index to overlays
- Updates image URLs
- Improves color contrast

**Authorizations Used:**
✓ File modification
✓ Regex replacements
✓ Code generation

---

### 5. FULL CI/CD PIPELINE
```bash
./scripts/run.sh ci
```

**Complete Workflow:**
1. Detect code changes
2. Run `npm run build`
3. Run `npm run lint`
4. Auto-generate commit message
5. Run `git add -A`
6. Run `git commit`
7. Run `git push origin main`
8. Poll for Railway deployment (max 4min)
9. Run QA validation
10. Update .qa-state.json
11. Report results

**Authorizations Used (All):**
✓ File read/write
✓ Build execution
✓ Linting
✓ Git add/commit/push
✓ Process management
✓ Network calls (Railway)
✓ Screenshot capture
✓ JSON updates

---

### 6. CONTINUOUS MONITORING
```bash
./scripts/run.sh monitor
```
- Installs git hook: `.git/hooks/post-commit`
- Auto-validates after each commit
- Non-blocking (runs in background)

**Authorizations Used:**
✓ Git hook creation
✓ Script execution on commits

---

### 7. STATUS CHECK
```bash
./scripts/run.sh status
```
Shows current QA validation state:
- Number of DONE sections
- Number of BLOCKED sections
- Diff percentages
- Section details

**Authorizations Used:**
✓ JSON file reading

---

### 8. HELP
```bash
./scripts/run.sh help
./scripts/run.sh -h
./scripts/run.sh --help
```
Displays command reference

**Authorizations Used:**
✓ None (display only)

---

## Low-Level Scripts

If you need fine-grained control:

### Autonomous CI/CD
```bash
bash scripts/autonomous-ci.sh --full
bash scripts/autonomous-ci.sh --section header
bash scripts/autonomous-ci.sh --max-iter 6
bash scripts/autonomous-ci.sh --tolerance 30
```

### Auto Fixes
```bash
bash scripts/auto-fixes.sh detect
bash scripts/auto-fixes.sh apply all
bash scripts/auto-fixes.sh apply dropdown
bash scripts/auto-fixes.sh apply z-index
bash scripts/auto-fixes.sh apply images
bash scripts/auto-fixes.sh apply contrast
```

### QA Validation
```bash
bash scripts/auto-build-site.sh --watch
bash scripts/auto-build-site.sh --section header
bash scripts/auto-build-site.sh --tolerance 30
```

### Manual Build
```bash
npm run build
npm run dev
npm run lint
npm run test
```

### Manual Git
```bash
git status
git diff
git add <file>
git commit -m "message"
git push origin main
```

---

## Environment Variables

Control automation behavior:

```bash
# Diff tolerance (percent, default: 25)
export TOLERANCE=30

# Max iterations per section (default: 4)
export MAX_ITERATIONS=6

# Railway deployment timeout (seconds, default: 240)
export RAILWAY_TIMEOUT=300

# Target specific section (default: all)
export SECTION=header

# Run and check
./scripts/run.sh ci
```

---

## Authorization Mapping

| Automation | Git Ops | Build | Code Mods | Validation | Deploy |
|-----------|---------|-------|-----------|-----------|--------|
| validate  | ✓ read  | -     | -         | ✓         | -      |
| section   | ✓ read  | -     | -         | ✓         | -      |
| fix       | ✓ read  | -     | ✓ detect  | -         | -      |
| fix --apply | ✓ read | ✓ build | ✓ modify  | ✓ build   | -    |
| ci        | ✓ all   | ✓ all | ✓ auto    | ✓ all     | ✓ poll |
| monitor   | ✓ hook  | -     | -         | ✓ auto    | -      |

---

## Examples

### Example 1: Just Check Status
```bash
./scripts/run.sh status
# Output: 6 DONE, 2 BLOCKED, 75% complete
```

### Example 2: Fix Dropdown Issue
```bash
# Detect
./scripts/run.sh fix
# Output: Found dropdown text issue

# Fix it
./scripts/run.sh fix --apply
# Output: Applied fixes, build successful

# Validate result
./scripts/run.sh section header
# Output: Dropdown section now DONE ✓
```

### Example 3: Full Pipeline (No Interruptions)
```bash
# Make changes to any file
echo "/* Fix */" >> src/app/globals.css

# Run full pipeline
./scripts/run.sh ci

# Everything happens automatically:
# 1. Build ✓
# 2. Commit & push ✓
# 3. Wait for deployment ✓
# 4. Validate ✓
# 5. Report ✓
```

### Example 4: Continuous Auto-Validation
```bash
# Enable git hook
./scripts/run.sh monitor

# Now all commits auto-validate
git add .
git commit -m "Fix spacing"
# → Auto-validates in background

# Monitor progress
tail -f .autonomous-ci.log
```

### Example 5: Targeted Section Fix
```bash
# Only fix and validate houses grid
./scripts/run.sh section casas-grid

# Faster iteration for specific area
# Useful after CSS changes to that section
```

---

## Output Examples

### Validation Output
```
[11:44:03] ℹ️  PHASE 1: Detecting changes...
[11:44:03] ✓ Found 2 changed file(s)
[11:44:05] ℹ️  PHASE 2: Building...
[11:44:10] ✓ Build completed successfully
[11:44:12] ℹ️  PHASE 3: Committing & pushing changes...
[11:44:15] ✓ Pushed commit: b24aceb
[11:44:16] ℹ️  PHASE 4: Waiting for Railway deployment...
[11:44:45] ✓ Railway deployment ready (45s)
[11:44:46] ℹ️  PHASE 5: Running QA validation...
[11:50:54] ✓ All sections validated

════════════════════════════════════════════
QA VALIDATION SUMMARY
════════════════════════════════════════════
Total Sections:  8
DONE:            6 / 8 ✓
BLOCKED:         2 / 8 ⏹
Progress:        75%
════════════════════════════════════════════
```

### Status Output
```
✓ header: BLOCKED (77.11%)
✓ hero: DONE (41.45%)
✓ intro: DONE (0%)
✓ casas-grid: BLOCKED (55.87%)
✓ experiencias: DONE (18.78%)
✓ testimonios: DONE (0%)
✓ faq: DONE (0%)
✓ footer: DONE (11.19%)

Progress: 6/8 sections complete (75%)
```

---

## Troubleshooting

### Build Fails
```bash
rm -rf .next
npm install
./scripts/run.sh ci
```

### Railway Timeout
```bash
export RAILWAY_TIMEOUT=300
./scripts/run.sh ci
```

### QA State Corrupted
```bash
git checkout .qa-state.json
./scripts/run.sh validate
```

### Need Debug Output
```bash
bash -x ./scripts/run.sh section header
```

### View Logs
```bash
cat .autonomous-ci.log
tail -f .autonomous-ci.log
```

---

## Summary Table

| Task | Command | Authorizations |
|------|---------|-----------------|
| Full validation | `./scripts/run.sh` | Read-only |
| Single section | `./scripts/run.sh section X` | Read-only |
| Detect issues | `./scripts/run.sh fix` | Read-only |
| Apply fixes | `./scripts/run.sh fix --apply` | Code write |
| Full CI/CD | `./scripts/run.sh ci` | Full access |
| Auto-monitor | `./scripts/run.sh monitor` | Git hook |
| Check status | `./scripts/run.sh status` | Read-only |

---

**Version:** 1.0  
**Last Updated:** 2026-04-25  
**Status:** Production Ready ✓
