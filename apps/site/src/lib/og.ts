import { withBase } from "./url";

// Every page has a 1200 x 630 social card at /og/<slug>.jpg, rendered by
// scripts/og.mjs from src/pages/og/[slug].astro.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** "docs/components/aurora" becomes "docs-components-aurora"; the landing page is "index". */
export function ogSlug(id: string): string {
  return id.replace(/(^|\/)index$/, "").replace(/\//g, "-") || "index";
}

/** Absolute URL of a page's card, as social sites need. */
export function ogImageUrl(id: string, site: URL | undefined): string {
  return new URL(withBase(`/og/${ogSlug(id)}.jpg`), site).href;
}
