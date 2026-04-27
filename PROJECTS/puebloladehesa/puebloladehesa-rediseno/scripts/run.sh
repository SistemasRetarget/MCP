#!/bin/bash
#
# Pueblo La Dehesa - Master Automation Script
#
# This is the single entry point for all CI/CD automation.
# Zero human interaction required.
#
# Usage:
#   ./scripts/run.sh                  # Full validation loop
#   ./scripts/run.sh --fix            # Detect and fix issues
#   ./scripts/run.sh --section NAME   # Validate single section
#   ./scripts/run.sh --ci             # Full CI/CD pipeline
#   ./scripts/run.sh --monitor        # Continuous monitoring
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
log() { echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $@"; }
ok() { echo -e "${GREEN}✓${NC} $@"; }
warn() { echo -e "${YELLOW}⚠${NC} $@"; }
err() { echo -e "${RED}✗${NC} $@" >&2; }

# ════════════════════════════════════════════════════════════════════════════════
# COMMAND HANDLERS
# ════════════════════════════════════════════════════════════════════════════════

cmd_validate() {
  log "Starting QA validation..."
  bash "$PROJECT_ROOT/scripts/auto-build-site.sh" --watch --tolerance 25
  ok "QA validation complete"
}

cmd_section() {
  local section="$1"
  log "Validating section: $section"
  bash "$PROJECT_ROOT/scripts/auto-build-site.sh" --section "$section"
  ok "Section validation complete"
}

cmd_fix() {
  log "Detecting issues..."
  bash "$PROJECT_ROOT/scripts/auto-fixes.sh" detect

  if [ "$1" = "--apply" ]; then
    log "Applying auto-fixes..."
    bash "$PROJECT_ROOT/scripts/auto-fixes.sh" apply all
    ok "Fixes applied - running build..."
    npm run build >/dev/null
    ok "Build successful"
  fi
}

cmd_ci() {
  log "Starting autonomous CI/CD pipeline..."
  bash "$PROJECT_ROOT/scripts/autonomous-ci.sh" --full --tolerance 25
  ok "CI/CD pipeline complete"
}

cmd_monitor() {
  log "Starting continuous monitoring..."
  log "Will validate on each commit (requires git hooks)"

  # Install git hook
  local hook_path=".git/hooks/post-commit"
  mkdir -p "$(dirname "$hook_path")"

  cat > "$hook_path" << 'HOOK'
#!/bin/bash
# Auto-validate after commits
cd "$(git rev-parse --show-toplevel)"
bash scripts/auto-build-site.sh --section header >/dev/null 2>&1 || true
HOOK

  chmod +x "$hook_path"
  ok "Git hook installed - auto-validation enabled"
  log "Monitor mode active. Validation runs after each commit."
}

cmd_status() {
  log "Current QA Status:"
  echo ""
  jq '.sections[] | "\(.id): \(.status) (\(.last_diff)%)" ' .qa-state.json | head -20
  echo ""
  log "For full details: cat .qa-state.json | jq"
}

cmd_help() {
  cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║  Pueblo La Dehesa - Autonomous Automation System               ║
╚════════════════════════════════════════════════════════════════╝

USAGE
  ./scripts/run.sh COMMAND [OPTIONS]

COMMANDS
  validate              QA validation loop (default)
  section NAME          Validate specific section (header, casas-grid, etc)
  fix [--apply]         Detect issues (or apply fixes with --apply)
  ci                    Full CI/CD pipeline (commit → build → deploy → validate)
  monitor               Enable continuous monitoring with git hooks
  status                Show current QA status
  help                  Show this message

EXAMPLES
  ./scripts/run.sh                        # Full validation
  ./scripts/run.sh section header          # Validate header only
  ./scripts/run.sh fix                     # Detect issues
  ./scripts/run.sh fix --apply            # Detect & fix automatically
  ./scripts/run.sh ci                      # Full CI/CD pipeline
  ./scripts/run.sh monitor                 # Enable auto-validation

FEATURES
  ✓ Zero human interaction
  ✓ Auto-detect changes
  ✓ Auto-commit & push
  ✓ Wait for Railway deployment
  ✓ QA validation loop
  ✓ Auto-rollback on failure
  ✓ Continuous monitoring

ENVIRONMENT VARIABLES
  SECTION               Force section validation
  TOLERANCE             Diff tolerance (default: 25%)
  MAX_ITERATIONS        Max QA iterations (default: 4)
  RAILWAY_TIMEOUT       Wait for Railway (default: 240s)

EOF
}

# ════════════════════════════════════════════════════════════════════════════════
# MAIN
# ════════════════════════════════════════════════════════════════════════════════

main() {
  # Print header
  cat << 'EOF'

    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   Pueblo La Dehesa - Automation System        ║
    ║   Fully autonomous • Zero interruptions       ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝

EOF

  local cmd="${1:-validate}"
  local arg="${2:-}"

  case "$cmd" in
    validate|default)
      cmd_validate
      ;;
    section)
      if [ -z "$arg" ]; then
        err "Section name required"
        echo "Usage: ./scripts/run.sh section NAME"
        exit 1
      fi
      cmd_section "$arg"
      ;;
    fix)
      cmd_fix "$arg"
      ;;
    ci)
      cmd_ci
      ;;
    monitor)
      cmd_monitor
      ;;
    status)
      cmd_status
      ;;
    help|-h|--help)
      cmd_help
      ;;
    *)
      err "Unknown command: $cmd"
      echo "Run: ./scripts/run.sh help"
      exit 1
      ;;
  esac

  echo ""
  log "╔════════════════════════════════════════════╗"
  log "║  Automation Complete ✓                    ║"
  log "╚════════════════════════════════════════════╝"
}

if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  main "$@"
fi
