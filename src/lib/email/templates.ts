import fs from "node:fs";
import path from "node:path";

/**
 * Loads and renders the standalone HTML email templates that live in
 * docs/email-templates/. These are the same templates pasted into Supabase
 * for the auth emails (magic-link.html, confirm-signup.html), plus their
 * transactional siblings (proposal-approved-admin.html,
 * proposal-approved-client.html) sent from API routes via Resend.
 *
 * Why this lives here:
 *
 *   Keeping the HTML in /docs makes it easy to preview in a browser and
 *   iterate on the design. Server-side code loads the file at runtime and
 *   replaces moustache-style tokens before sending. One source of truth,
 *   no copy-paste drift between code and template.
 *
 * Vercel / Next 16 note:
 *
 *   The docs/ folder is outside src/ so Next won't auto-bundle it. The
 *   `outputFileTracingIncludes` entry in next.config.ts pulls these files
 *   into the function bundle for the approve route so fs.readFileSync
 *   works in production. If you add a new template, leave it under
 *   docs/email-templates/*.html and the existing trace include picks it
 *   up automatically.
 */

const TEMPLATES_DIR = path.join(
  process.cwd(),
  "docs",
  "email-templates"
);

// Small in-process cache. Templates are static at deploy time, so we read
// each one once per cold start.
const templateCache: Map<string, string> = new Map();

export function loadTemplate(name: string): string {
  const cached = templateCache.get(name);
  if (cached) return cached;

  const filePath = path.join(TEMPLATES_DIR, `${name}.html`);
  const html = fs.readFileSync(filePath, "utf8");
  templateCache.set(name, html);
  return html;
}

/**
 * Replace {{ token }} occurrences in `html` with the matching value in
 * `vars`. Tokens are matched with optional whitespace inside the braces.
 * Missing tokens become empty strings, which is intentional: it lets a
 * single template degrade gracefully when an optional field is absent.
 *
 * NOTE: this is intentionally not a general-purpose templating engine.
 * Values must already be HTML-safe (escape user input before passing it
 * in). For the small, controlled surface here that's a fair trade for
 * the simplicity.
 */
export function renderTemplate(
  html: string,
  vars: Record<string, string>
): string {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : "";
  });
}

export function renderEmail(
  templateName: string,
  vars: Record<string, string>
): string {
  return renderTemplate(loadTemplate(templateName), vars);
}
