import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { withBase } from "@/lib/url";
import { codeFor, frameworks } from "./code";
import { ColorInput } from "./ColorInput";
import { changedProps, readLink, same, startValues, writeLink, type Control, type Value, type Values } from "./controls";
import { Range } from "./Range";
import { useFramework } from "./useFramework";

interface DemoProps {
  /** Component name, such as "Plasma". */
  name: string;
  controls: Control[];
  /** Named sets of values. Values a preset leaves out go back to where the demo starts. */
  presets?: Record<string, Values>;
  /** The picture an image effect shows. The demo adds a switch to a video. */
  image?: { src: string; alt: string };
  /** Attributes every use needs, for the code. */
  fixed?: Record<string, unknown>;
  /** Markup inside the component, for the code. */
  children?: string;
  /** Whether the component takes a class, for the code. Defaults to true. */
  sized?: boolean;
  /** The props to show in the code, when they aren't simply the changed controls. */
  codeProps?(values: any): any;
  /** A line about how to use the demo. */
  hint?: string;
  render(props: any): ReactNode;
}

/** A live demo: the effect, its props, presets, and the code for what's on screen. */
export function Demo({
  name,
  controls,
  presets = {},
  image,
  fixed,
  children,
  sized,
  codeProps,
  hint,
  render,
}: DemoProps) {
  const start = useMemo(() => startValues(controls), [controls]);
  const [values, setValues] = useState(start);
  const [video, setVideo] = useState(false);
  const [paused, setPaused] = useState(false);
  const [framework, setFramework] = useFramework();

  // Applied after mounting, so the first render matches the server's.
  useEffect(() => {
    const linked = readLink(controls, location.search);
    if (Object.keys(linked).length) setValues((v) => ({ ...v, ...linked }));
  }, [controls]);

  const set = (key: string, value: Value) => setValues((v) => ({ ...v, [key]: value }));
  const matches = (preset: Values) => controls.every((c) => same(values[c.name], preset[c.name] ?? start[c.name]));
  const atStart = matches({});

  const media = image && {
    src: withBase(video ? "/demo-video.mp4" : image.src),
    alt: video ? "Glossy colored spheres circling each other" : image.alt,
    paused: video && paused,
  };
  const props = codeProps ? codeProps(values) : changedProps(controls, values);
  const code = codeFor(framework, {
    name,
    fixed: image ? { src: video ? "/clip.mp4" : "/photo.jpg", alt: "Describe it here", ...fixed } : fixed,
    props: media?.paused ? { ...props, paused: true } : props,
    children,
    sized,
  });

  return (
    <div className="demo not-content">
      {render({ ...values, ...media })}
      <div className="demo-controls">
        {controls.map((control) => (
          <ControlInput
            key={control.name}
            control={control}
            value={values[control.name]}
            onChange={(v) => set(control.name, v)}
          />
        ))}
        {hint && <span>{hint}</span>}
      </div>
      <div className="demo-bar">
        {Object.entries(presets).map(([label, preset]) => (
          <button
            key={label}
            type="button"
            aria-pressed={matches(preset)}
            onClick={() => setValues({ ...start, ...preset })}
          >
            {label}
          </button>
        ))}
        {image && (
          <button type="button" aria-pressed={video} onClick={() => setVideo(!video)}>
            Use a video
          </button>
        )}
        {video && (
          <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
            Pause it
          </button>
        )}
        <span className="demo-bar-end">
          <button type="button" disabled={atStart} onClick={() => setValues(start)}>
            Reset
          </button>
          <CopyButton
            label="Copy link"
            text={() => `${location.origin}${location.pathname}${writeLink(controls, values)}`}
          />
        </span>
      </div>
      <div className="demo-code">
        <div className="demo-code-bar">
          <span role="group" aria-label="Framework">
            {frameworks.map((f) => (
              <button key={f} type="button" aria-pressed={f === framework} onClick={() => setFramework(f)}>
                {f}
              </button>
            ))}
          </span>
          <CopyButton label="Copy code" text={() => code} />
        </div>
        <pre tabIndex={0} aria-label={`${framework} code for this demo`}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface ControlInputProps {
  control: Control;
  value: Value;
  onChange(value: Value): void;
}

function ControlInput({ control, value, onChange }: ControlInputProps) {
  const id = useId();
  switch (control.kind) {
    case "range":
      return (
        <Range
          label={control.name}
          value={value as number}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={onChange}
        />
      );
    case "color":
      return <ColorInput label={control.name} value={value as string} onChange={onChange} />;
    case "colors":
      return (value as string[]).map((c, i, list) => (
        <ColorInput
          key={i}
          label={`Color ${i + 1}`}
          value={c}
          onChange={(next) => onChange(list.map((old, j) => (j === i ? next : old)))}
        />
      ));
    case "toggle":
      return (
        <label htmlFor={id}>
          {control.name}
          <input id={id} type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} />
        </label>
      );
    case "select":
      return (
        <label htmlFor={id}>
          {control.name}
          <select id={id} value={value as string} onChange={(e) => onChange(e.target.value)}>
            {control.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      );
    case "text":
      return (
        <label htmlFor={id}>
          {control.name}
          <input id={id} value={value as string} onChange={(e) => onChange(e.target.value)} style={{ width: "12rem" }} />
        </label>
      );
  }
}

function CopyButton({ label, text }: { label: string; text(): string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text());
      setState("done");
    } catch {
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button type="button" onClick={copy}>
      <span aria-live="polite">{state === "done" ? "Copied" : state === "failed" ? "Couldn’t copy" : label}</span>
    </button>
  );
}
