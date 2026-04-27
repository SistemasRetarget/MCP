import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "src/content/legal");

/**
 * Load a legal text file and split into clean blocks.
 * Returns array of paragraphs/headings. Lines starting with a digit + dot
 * (e.g. "1. Responsable") or single-line short text are treated as headings.
 */
export type Block = { type: "h2" | "p"; text: string };

export function loadLegal(filename: string): Block[] {
  const full = path.join(ROOT, filename);
  let raw = "";
  try {
    raw = fs.readFileSync(full, "utf8");
  } catch {
    return [];
  }
  const lines = raw
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  // Drop the first line if it's the page title (handled by H1 in the page)
  const blocks: Block[] = [];
  let i = 0;
  if (lines.length && /(t[ée]rminos|pol[íi]ticas)/i.test(lines[0])) i = 1;

  for (; i < lines.length; i++) {
    const line = lines[i];
    const isHeading =
      /^\d+\.\s+[A-ZÁÉÍÓÚÑ]/.test(line) || // "1. Responsable"
      /^(generalidades|cookies|definiciones|alcance|aceptaci[óo]n|modificaciones|contacto|seguridad|derechos|tratamiento|datos|finalidad|transferencia)/i.test(line);
    if (isHeading && line.length < 120) {
      blocks.push({ type: "h2", text: line });
    } else {
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}
