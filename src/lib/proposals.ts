/**
 * Proposal routing helpers.
 *
 * Projects whose proposal is served as a custom-HTML bundle under
 * /public/protected/p/{slug}/ (instead of via the default ProposalViewV2
 * React component on /[slug]) are listed here. Add a slug to this set
 * the moment a new custom-HTML proposal goes live, and every link in
 * the app (client area, admin dashboard, [slug] redirect) routes to the
 * correct URL.
 *
 * This is a transitional indirection. Long-term, the field should live
 * on the projects table (e.g. `custom_proposal_path` or a discriminated
 * `proposal_kind`), so adding a new proposal is data entry rather than
 * a code change. Until then, this single source of truth keeps the
 * router consistent.
 */
export const CUSTOM_PROPOSAL_SLUGS: ReadonlySet<string> = new Set([
  "la-startup-2026",
]);

/**
 * Returns the canonical URL where this project's proposal should be
 * viewed. For projects with a custom-HTML proposal, that's the
 * auth-gated /protected/p/{slug}/index.html path. For everything else,
 * the default /[slug] route renders ProposalViewV2.
 *
 * Why the explicit index.html: Next.js dev with Turbopack doesn't
 * auto-serve folder/index.html when you request the folder URL.
 * Explicit filename works consistently across dev and production.
 */
export function proposalHref(slug: string): string {
  if (CUSTOM_PROPOSAL_SLUGS.has(slug)) {
    return `/protected/p/${slug}/index.html`;
  }
  return `/${slug}`;
}

export function isCustomProposal(slug: string): boolean {
  return CUSTOM_PROPOSAL_SLUGS.has(slug);
}
