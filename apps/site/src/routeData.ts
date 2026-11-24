import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { OG_HEIGHT, OG_WIDTH, ogImageUrl } from "./lib/og";
import { withBase } from "./lib/url";

// Adds what Starlight leaves out of each docs page's <head>: the social card,
// the home screen icon, and component page titles that say what they are.
export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const { head } = route;

  if (route.id.startsWith("docs/components/")) {
    const title = `${route.entry.data.title}: WebGL component for React, Vue and Nuxt | Glimmer UI`;
    for (const tag of head) {
      if (tag.tag === "title") tag.content = title;
      if (tag.tag === "meta" && tag.attrs?.property === "og:title") tag.attrs.content = title;
    }
  }

  // The 404 page has no card of its own.
  const image = ogImageUrl(route.id === "404" ? "index" : route.id, context.site);
  const alt = `${route.entry.data.title}, Glimmer UI`;
  head.push(
    { tag: "meta", attrs: { property: "og:image", content: image } },
    { tag: "meta", attrs: { property: "og:image:width", content: String(OG_WIDTH) } },
    { tag: "meta", attrs: { property: "og:image:height", content: String(OG_HEIGHT) } },
    { tag: "meta", attrs: { property: "og:image:alt", content: alt } },
    { tag: "meta", attrs: { name: "twitter:image", content: image } },
    { tag: "meta", attrs: { name: "twitter:image:alt", content: alt } },
    { tag: "link", attrs: { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png") } }
  );
});
