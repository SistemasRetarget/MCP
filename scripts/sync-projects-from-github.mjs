#!/usr/bin/env node
/**
 * sync-projects-from-github.mjs
 *
 * Genera un <id>-config.json en mcp-projects/ por cada repo de la org
 * SistemasRetarget en GitHub. NO sobreescribe configs ya editados manualmente
 * (detecta presencia de "reconnaissance" o "landings" no vacíos).
 *
 * Uso: node scripts/sync-projects-from-github.mjs
 *
 * No consume créditos Claude. Solo GitHub API + filesystem local.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROJECTS_DIR = join(ROOT, "mcp-projects");
const ORG = "SistemasRetarget";
const SKIP = new Set(); // ningún repo se excluye — el propio MCP es un proyecto meta

if (!existsSync(PROJECTS_DIR)) mkdirSync(PROJECTS_DIR, { recursive: true });

console.log(`[sync] listando repos de la org ${ORG}…`);
const raw = execSync(
  `gh repo list ${ORG} --limit 50 --json name,description,url,defaultBranchRef,updatedAt,isPrivate,pushedAt`,
  { encoding: "utf8" }
);
const repos = JSON.parse(raw);

let created = 0, updated = 0, skipped = 0;

for (const r of repos) {
  if (SKIP.has(r.name)) {
    console.log(`  [skip] ${r.name} (excluido)`);
    skipped++;
    continue;
  }
  const id = r.name; // usamos el nombre del repo como id directo
  const file = join(PROJECTS_DIR, `${id}-config.json`);
  const exists = existsSync(file);

  let cfg;
  if (exists) {
    cfg = JSON.parse(readFileSync(file, "utf8"));
    // Si el config tiene contenido editado manualmente, solo actualizamos campos derivados de GitHub
    const hasManualContent =
      (cfg.reconnaissance && cfg.reconnaissance.status) ||
      (Array.isArray(cfg.landings) && cfg.landings.length > 0) ||
      (cfg.replication && cfg.replication.progress_percent);
    if (hasManualContent) {
      // refrescar solo metadata de github
      cfg.repositories = cfg.repositories || {};
      cfg.repositories.qa = cfg.repositories.qa || { type: "unknown" };
      cfg.repositories.qa.github = r.url;
      cfg.github = {
        url: r.url,
        default_branch: r.defaultBranchRef?.name || "main",
        is_private: r.isPrivate,
        last_pushed_at: r.pushedAt,
        last_updated_at: r.updatedAt,
      };
      writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
      console.log(`  [refresh] ${id} (github metadata actualizada)`);
      updated++;
      continue;
    }
  }

  // Config nuevo o vacío: generar esqueleto mínimo válido
  const branch = r.defaultBranchRef?.name || "main";
  const ageDays = Math.floor((Date.now() - new Date(r.pushedAt || r.updatedAt).getTime()) / 86400000);
  const status = ageDays > 90 ? "archived" : "active";

  cfg = {
    project_id: id,
    project_name: r.name,
    description: r.description || `Repo ${id} de ${ORG}`,
    status,
    created_at: new Date().toISOString(),
    repositories: {
      source: { url: "", type: "unknown", description: "Por definir" },
      qa: {
        url: "",
        type: "unknown",
        github: r.url,
        description: "Por definir — agregar URL de QA cuando exista deploy",
      },
      production: { url: "", type: "unknown", description: "Por definir" },
    },
    github: {
      url: r.url,
      default_branch: branch,
      is_private: r.isPrivate,
      last_pushed_at: r.pushedAt,
      last_updated_at: r.updatedAt,
    },
    reconnaissance: { status: "pending" },
    replication: {
      status: "not_started",
      progress_percent: 0,
      completed_sections: [],
      pending_sections: [],
    },
    workflow: { current_step: "discovery", steps: [] },
    team_assignments: {},
    deployment: { status: "not_deployed" },
    landings: [],
    resources: {
      github_repo: r.url,
      production_url: "",
      qa_url: "",
      notes: `Sincronizado desde GitHub el ${new Date().toISOString().split("T")[0]}. Editar este archivo para añadir landings, recursos y workflow.`,
    },
    team: [],
    branding: {},
  };

  writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
  if (exists) {
    console.log(`  [update] ${id}`);
    updated++;
  } else {
    console.log(`  [create] ${id}`);
    created++;
  }
}

console.log(`\n[sync] resumen: ${created} creados, ${updated} actualizados, ${skipped} saltados.`);
