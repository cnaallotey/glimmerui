/**
 * Prefixes a root-relative path with the site's base path, so links and images
 * work when the site is served from a subfolder (GitHub Pages serves it at
 * /glimmerui/).
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `${base}${path}` : path;
}
