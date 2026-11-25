// What a docs demo lets visitors change. Each control is one prop.

interface Base<T> {
  name: string;
  /** Where the demo starts. */
  value: T;
  /** The component's own default, when the demo starts somewhere else. */
  standard?: T;
}

export type Control =
  | ({ kind: "range"; min: number; max: number; step: number } & Base<number>)
  | ({ kind: "color" } & Base<string>)
  | ({ kind: "colors" } & Base<string[]>)
  | ({ kind: "toggle" } & Base<boolean>)
  | ({ kind: "select"; options: string[] } & Base<string>)
  | ({ kind: "text" } & Base<string>);

export type Value = Control["value"];
export type Values = Record<string, Value>;

export const range = (name: string, value: number, min: number, max: number, step: number, standard?: number): Control => ({
  kind: "range", name, value, min, max, step, standard,
});
export const color = (name: string, value: string, standard?: string): Control => ({ kind: "color", name, value, standard });
export const colors = (name: string, value: string[], standard?: string[]): Control => ({ kind: "colors", name, value, standard });
export const toggle = (name: string, value: boolean, standard = false): Control => ({ kind: "toggle", name, value, standard });
export const select = (name: string, value: string, options: string[]): Control => ({ kind: "select", name, value, options });
export const text = (name: string, value: string): Control => ({ kind: "text", name, value, standard: "" });

export const same = (a: Value, b: Value) =>
  Array.isArray(a) && Array.isArray(b) ? a.join() === b.join() : a === b;

export const startValues = (controls: Control[]): Values =>
  Object.fromEntries(controls.map((c) => [c.name, c.value]));

/** The props that differ from the component's own defaults, which is all the code needs. */
export function changedProps(controls: Control[], values: Values): Values {
  const changed: Values = {};
  for (const c of controls) {
    const value = values[c.name];
    if (!same(value, c.standard ?? c.value)) changed[c.name] = value;
  }
  return changed;
}

const HEX = /^[0-9a-f]{6}$/i;

/**
 * Reads values from a shared link. Anything that isn't a valid value for its
 * control is ignored, and free text is never read: it ends up in copied code.
 */
export function readLink(controls: Control[], search: string): Values {
  const params = new URLSearchParams(search);
  const values: Values = {};
  for (const c of controls) {
    const raw = params.get(c.name);
    if (raw === null) continue;
    if (c.kind === "range") {
      const n = Number(raw);
      if (raw !== "" && Number.isFinite(n)) values[c.name] = Math.min(c.max, Math.max(c.min, n));
    } else if (c.kind === "color") {
      if (HEX.test(raw)) values[c.name] = `#${raw.toLowerCase()}`;
    } else if (c.kind === "colors") {
      const list = raw.split("-");
      if (list.length === c.value.length && list.every((v) => HEX.test(v))) {
        values[c.name] = list.map((v) => `#${v.toLowerCase()}`);
      }
    } else if (c.kind === "toggle") {
      if (raw === "1" || raw === "0") values[c.name] = raw === "1";
    } else if (c.kind === "select" && c.options.includes(raw)) {
      values[c.name] = raw;
    }
  }
  return values;
}

/** The query for a link to these values: only what differs from where the demo starts. */
export function writeLink(controls: Control[], values: Values): string {
  const params = new URLSearchParams();
  for (const c of controls) {
    const value = values[c.name];
    if (c.kind === "text" || same(value, c.value)) continue;
    if (Array.isArray(value)) params.set(c.name, value.map((v) => v.slice(1)).join("-"));
    else if (typeof value === "boolean") params.set(c.name, value ? "1" : "0");
    else params.set(c.name, c.kind === "color" ? String(value).slice(1) : String(value));
  }
  const query = params.toString();
  return query && `?${query}`;
}
