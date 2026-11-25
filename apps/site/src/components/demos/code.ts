import type { Values } from "./controls";

export const frameworks = ["React", "Vue", "Svelte", "JavaScript"] as const;
export type Framework = (typeof frameworks)[number];

export interface Snippet {
  /** Component name, such as "Plasma". */
  name: string;
  /** Attributes every use needs, such as src and alt. */
  fixed?: Record<string, unknown>;
  /** The props the visitor changed. */
  props: Values;
  /** Text or markup inside the component. */
  children?: string;
  /** Whether the component takes a class. Defaults to true. */
  sized?: boolean;
}

/** A value as JavaScript, the way a person would write it. */
function js(value: unknown, quote = '"', indent = ""): string {
  if (typeof value === "string") {
    const text = JSON.stringify(value);
    return quote === '"' ? text : `'${text.slice(1, -1).replace(/\\"/g, '"').replace(/'/g, "\\'")}'`;
  }
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object")) return `[${value.map((v) => js(v, quote)).join(", ")}]`;
    const inner = `${indent}  `;
    return `[\n${value.map((v) => `${inner}${js(v, quote, inner)},`).join("\n")}\n${indent}]`;
  }
  if (value && typeof value === "object") {
    return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${js(v, quote)}`).join(", ")} }`;
  }
  return String(value);
}

/** Text as an HTML attribute value. */
const attr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const isPlain = (value: string) => !/["\\{}&<>\n]/.test(value);

function attribute(framework: Framework, name: string, value: unknown): string {
  if (value === true) return name;
  if (framework === "Vue") {
    return typeof value === "string"
      ? `${name}="${attr(value)}"`
      : `:${name}="${js(value, "'").replace(/\n\s*/g, " ")}"`;
  }
  return typeof value === "string" && isPlain(value) ? `${name}="${value}"` : `${name}={${js(value)}}`;
}

/** Object lists get a variable, since they're unreadable inside an attribute. */
const isObjectList = (value: unknown): value is object[] =>
  Array.isArray(value) && typeof value[0] === "object";

export function codeFor(framework: Framework, snippet: Snippet): string {
  const { name, fixed = {}, props, children, sized = true } = snippet;
  if (framework === "JavaScript") {
    const options: Record<string, unknown> = { ...fixed, ...props };
    delete options.alt;
    for (const [key, value] of Object.entries(options)) {
      if (isObjectList(value)) options[key] = value.map((v) => (v as { src: string }).src);
    }
    const lines = Object.entries(options).map(([k, v]) => `  ${k}: ${js(v, '"', "  ")},\n`);
    return `import { create${name} } from "@glimmerui/core";

const element = document.querySelector("#effect");
create${name}(element${lines.length ? `, {\n${lines.join("")}}` : ""});`;
  }

  const lists = Object.entries(fixed).filter(([, v]) => isObjectList(v));
  const all: [string, unknown][] = [...Object.entries(fixed), ...Object.entries(props)];
  if (sized) all.push([framework === "React" ? "className" : "class", "h-96"]);
  const attrs = all.map(([k, v]) =>
    !isObjectList(v)
      ? attribute(framework, k, v)
      : framework === "Vue" ? `:${k}="${k}"` : `${k}={${k}}`
  );
  const oneLine = `<${name}${attrs.map((a) => ` ${a}`).join("")}`;
  const open = oneLine.length <= 64 ? oneLine : `<${name}\n${attrs.map((a) => `  ${a}\n`).join("")}`;
  const markup = children
    ? `${open}>\n  ${children}\n</${name}>`
    : open.endsWith("\n") ? `${open}/>` : `${open} />`;
  const pad = (code: string) => code.replace(/^(?=.)/gm, "  ");
  const vars = lists.map(([k, v]) => `const ${k} = ${js(v)};`).join("\n");
  const from = `import { ${name} } from "@glimmerui/${framework.toLowerCase()}";`;

  if (framework === "React") return [from, vars, markup].filter(Boolean).join("\n\n");
  if (framework === "Vue") {
    return `<script setup>\n${[from, vars].filter(Boolean).join("\n\n")}\n</script>\n\n<template>\n${pad(markup)}\n</template>`;
  }
  return `<script>\n${pad([from, vars].filter(Boolean).join("\n\n"))}\n</script>\n\n${markup}`;
}
