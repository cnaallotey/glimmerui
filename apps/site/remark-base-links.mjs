/**
 * Remark plugin: prefixes root-relative links in Markdown and MDX with the
 * site's base path, so docs can link to "/docs/react/" and still work when the
 * site is served from a subfolder. Handles Markdown links and link
 * definitions, plus `href` on MDX components such as <LinkCard>.
 */
export function remarkBaseLinks(base) {
  const prefix = base.replace(/\/$/, "");
  const fix = (value) =>
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith(`${prefix}/`)
      ? `${prefix}${value}`
      : value;

  const walk = (node) => {
    if (node.type === "link" || node.type === "definition") node.url = fix(node.url);
    if ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.attributes) {
      for (const attr of node.attributes) {
        if (attr.type === "mdxJsxAttribute" && attr.name === "href") attr.value = fix(attr.value);
      }
    }
    if (node.children) node.children.forEach(walk);
  };

  return () => (tree) => walk(tree);
}
