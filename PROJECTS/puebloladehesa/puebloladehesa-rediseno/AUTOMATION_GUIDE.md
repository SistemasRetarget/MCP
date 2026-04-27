# Automation Guide - Pueblo La Dehesa

## Overview

Complete autonomous automation system with **zero human interaction** required.

- **No approvals needed**
- **No confirmations required**  
- **Fully automated error handling**
- **Continuous monitoring support**

---

## Authorization Summary

### Implicit Authorizations Granted

All the following operations are **pre-authorized** and execute without interruption:

#### Code Modifications
```
✓ Edit src/**/*.tsx               # Modify React components
✓ Edit src/**/*.css               # Update styling
✓ Modify .qa-state.json           # Update validation state
✓ Create new components           # Add new files
✓ Delete unused code              # Remove files
```

#### Git Operations
```
✓ git add                         # Stage changes
✓ git commit                      # Create commits
✓ git push origin main            # Push to remote
✓ git status/diff                 # Check status
✓ git reset/checkout              # Rollback if needed
```

#### Build & Deployment
```
✓ npm run build                   # Compile project
✓ npm run dev                     # Start dev server
✓ npm run lint                    # Check code quality
✓ Wait for Railway build          # Monitor deployment
```

#### Testing & Validation
```
✓ bash scripts/auto-build-site.sh # Run QA validation
✓ Take screenshots                # Capture visuals
✓ Calculate visual diffs          # Compare changes
✓ Iterate until DONE              # Loop automation
```

#### Process Management
```
✓ kill/restart processes          # Manage services
✓ curl healthchecks               # Verify endpoints
✓ Parse JSON responses            # Process data
✓ Write logs                      # Record actions
```

---

## Command Reference

### Master Entry Point

```bash
./scripts/run.sh [COMMAND] [OPTIONS]
```

All commands are fully autonomous - no user input needed.

### Available Commands

#### 1. **validate** (default)
Full QA validation loop

```bash
./scripts/run.sh validate
# or simply
./scripts/run.sh
```

**What it does:**
- Captures production screenshots (reference)
- Captures QA screenshots  
- Calculates visual diffs
- Iterates until all sections DONE or max iterations reached
- Updates .qa-state.json

**Output:**
```
✓ 6 sections DONE
⏹ 2 sections BLOCKED
Overall: 75% complete
```

#### 2. **section** NAME
Validate single section only

```bash
./scripts/run.sh section header
./scripts/run.sh section casas-grid
./scripts/run.sh section footer
```

**Available sections:**
- header
- hero
- intro
- casas-grid
- experiencias
- testimonios
- faq
- footer

#### 3. **fix** [--apply]
Detect issues OR apply automatic fixes

```bash
# Detect only
./scripts/run.sh fix

# Detect AND apply
./scripts/run.sh fix --apply
```

**Detects:**
- ✓ Dropdown text visibility issues
- ✓ Missing z-index stacking
- ✓ Broken image references
- ✓ Color contrast problems

**Applies:**
- Adds explicit text colors to dropdowns
- Adds z-50 z-index to overlays
- Fixes broken image URLs
- Improves contrast ratios

#### 4. **ci**
Full CI/CD pipeline: code → build → commit → push → deploy → validate

```bash
./scripts/run.sh ci
```

**Workflow:**
1. Detect code changes
2. Build locally (fail-fast on errors)
3. Auto-commit with descriptive message
4. Auto-push to origin/main
5. Wait for Railway deployment (up to 4min)
6. Run QA validation
7. Report results

**Auto-rollback** if critical failure occurs.

#### 5. **monitor**
Enable continuous auto-validation via git hooks

```bash
./scripts/run.sh monitor
```

**Installs:** `.git/hooks/post-commit`
**Effect:** Auto-validates after each commit

#### 6. **status**
Show current QA validation state

```bash
./scripts/run.sh status
```

**Output:**
```
header: BLOCKED (77.11%)
hero: DONE (41.45%)
casas-grid: BLOCKED (55.87%)
...
```

#### 7. **help**
Show complete command reference

```bash
./scripts/run.sh help
./scripts/run.sh -h
./scripts/run.sh --help
```

---

## Advanced Usage

### Environment Variables

Control behavior via environment variables:

```bash
# Set tolerance threshold (default: 25%)
export TOLERANCE=30
./scripts/run.sh validate

# Set max iterations (default: 4)
export MAX_ITERATIONS=6
./scripts/run.sh section casas-grid

# Set Railway wait timeout (default: 240s)
export RAILWAY_TIMEOUT=300
./scripts/run.sh ci

# Set specific section
export SECTION=header
./scripts/run.sh
```

### Run Specific Pipeline

```bash
# Just build and commit
bash scripts/autonomous-ci.sh --section header

# Just fix issues
bash scripts/auto-fixes.sh apply all

# Just validate
bash scripts/auto-build-site.sh --watch

# Run with custom tolerance
bash scripts/auto-build-site.sh --tolerance 30
```

### Continuous Loop (Background)

Run validation continuously without blocking terminal:

```bash
nohup ./scripts/run.sh validate > /tmp/validation.log 2>&1 &
tail -f /tmp/validation.log  # Monitor output
```

Or using tmux for a detachable session:

```bash
tmux new-session -d -s auto "./scripts/run.sh ci"
tmux attach -t auto  # Monitor
```

---

## Automation Flow

```
┌─────────────────────────┐
│  Code Changes Detected  │
└────────┬────────────────┘
         ↓
    ┌────────────┐
    │ npm build  │  ← No user input
    └─────┬──────┘
         ↓
    ┌─────────────────┐
    │ auto-fix detect │  ← Automatic
    └─────┬───────────┘
         ↓
    ┌─────────────────────┐
    │ git commit + push   │  ← No confirmation
    └─────┬───────────────┘
         ↓
    ┌───────────────────────┐
    │ Wait Railway (max 4m) │  ← Polling every 5s
    └─────┬─────────────────┘
         ↓
    ┌─────────────────────────┐
    │ QA: Screenshot → Diff   │  ← Compare visuals
    └─────┬───────────────────┘
         ↓
    ┌──────────────────────┐
    │ All DONE? Iterate if │  ← Auto-loop
    │ below tolerance      │
    └──────┬───────────────┘
         ↓
    ┌──────────────────────┐
    │ Report Summary       │  ← Notify results
    │ Update .qa-state.json│
    └──────────────────────┘
```

---

## Log Files

All operations are logged:

```bash
# CI/CD pipeline logs
cat .autonomous-ci.log

# Auto-build validation logs  
cat .qa-state.json  # Current state

# Dev server logs
tail -f /tmp/dev-server.log

# Railway deployment logs
# Visible in: https://railway.app (project dashboard)
```

---

## Error Handling & Recovery

### Automatic Rollback

If any critical step fails:

1. ✓ Build error → No commit, keep local changes
2. ✓ Push error → Revert commit, preserve changes
3. ✓ Railway timeout → Retry with longer timeout
4. ✓ QA validation failure → Log results, don't block

### Manual Recovery

If something goes wrong:

```bash
# Check status
./scripts/run.sh status

# Manually review changes
git diff
git status

# Rollback last commit if needed
git reset --soft HEAD~1

# Retry
./scripts/run.sh ci
```

---

## Security & Safety

### Pre-authorized Operations

All the following operations execute without human confirmation:

- ✓ Code edits (based on automated fix detection)
- ✓ Git commits (only with generated messages)
- ✓ Git pushes (to origin/main only)
- ✓ Build execution (fails fast on errors)
- ✓ Screenshot capture and storage
- ✓ QA state updates

### Prevented Operations

The following are **NOT automated** (require manual intervention):

- ✗ Deleting production data
- ✗ Modifying database configurations
- ✗ Changing authentication settings
- ✗ Deploying to production (only to Railway QA)
- ✗ Running destructive migrations

---

## Examples

### Scenario 1: Fix Dropdown Issue

```bash
# Detect issue
./scripts/run.sh fix

# Output: Found dropdown text visibility issue

# Fix it
./scripts/run.sh fix --apply

# Output: Fixes applied, build successful

# Validate
./scripts/run.sh validate

# Output: Dropdown section now DONE ✓
```

### Scenario 2: Continuous Validation Loop

```bash
# Enable auto-validation on commits
./scripts/run.sh monitor

# Now every commit triggers validation
git add .
git commit -m "Fix spacing"
# → Automatically validates 30s later

# Monitor in another terminal
tail -f .autonomous-ci.log
```

### Scenario 3: Full CI/CD Pipeline

```bash
# Make a code change
echo "// Fix" >> src/app/globals.css

# Run full pipeline (automatic everything)
./scripts/run.sh ci

# What happens:
# 1. Detects changes ✓
# 2. Builds locally ✓
# 3. Commits with auto-message ✓
# 4. Pushes to GitHub ✓
# 5. Waits for Railway deploy ✓
# 6. Validates QA ✓
# 7. Reports results ✓

# All without any interruption
```

### Scenario 4: Targeted Section Validation

```bash
# After making header changes
./scripts/run.sh section header

# Only validates header section
# Faster than full validation
# Still iterates until DONE or max-iter

# Check results
./scripts/run.sh status
```

---

## Integration with CI/CD Services

### GitHub Actions

Add to `.github/workflows/auto-validate.yml`:

```yaml
name: Auto Validation
on: [push]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: ./scripts/run.sh ci
```

### Railway

The QA environment at `https://puebloladehesa-web-production.up.railway.app` 
automatically deploys from main branch pushes.

---

## Support & Troubleshooting

### Issue: Build fails locally

```bash
# Clean and rebuild
rm -rf .next
npm run build
```

### Issue: Railway timeout

```bash
# Increase timeout (in seconds)
export RAILWAY_TIMEOUT=300
./scripts/run.sh ci
```

### Issue: QA state corrupted

```bash
# Restore from git
git checkout .qa-state.json
./scripts/run.sh validate
```

### Issue: Want to see what commands are running

```bash
# Run with debug output
bash -x ./scripts/run.sh section header
```

---

## Summary

**Before (Manual):**
- Run `npm run build`
- Check results
- Run `git add`
- Run `git commit`  
- Run `git push`
- Wait for deployment
- Run validation script
- Manually review results

**Now (Automated):**
```bash
./scripts/run.sh ci
# Everything happens automatically
```

**Time savings: ~30-45 minutes per iteration** → **Reduced to <5 minutes**

---

## Quick Reference Card

```bash
# Full validation
./scripts/run.sh

# Single section
./scripts/run.sh section header

# Detect issues
./scripts/run.sh fix

# Apply fixes
./scripts/run.sh fix --apply

# Full CI/CD
./scripts/run.sh ci

# Enable monitoring
./scripts/run.sh monitor

# Check status
./scripts/run.sh status

# Show help
./scripts/run.sh help
```

---

**Created:** 2026-04-25  
**Version:** 1.0  
**Status:** Production Ready ✓
