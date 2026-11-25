import { CursorTrail } from "@glimmerui/react";
import { useState } from "react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#e0457b"),
  color("tail", "#f9b44c"),
  range("width", 10, 2, 30, 1),
  range("length", 20, 4, 40, 1),
];
const presets = {
  Comet: {},
  Ribbon: { width: 24, length: 36, color: "#3b1d8f", tail: "#22d3ee" },
  Spark: { width: 4, length: 10, color: "#facc15", tail: "#f97316" },
};

export function CursorTrailDemo() {
  const [on, setOn] = useState(false);
  return (
    <Demo
      name="CursorTrail"
      controls={controls}
      presets={presets}
      sized={false}
      render={(p) => (
        <div className="demo-stage demo-stage--card">
          <button type="button" className="demo-toggle" aria-pressed={on} onClick={() => setOn(!on)}>
            {on ? "Turn the trail off" : "Turn the trail on"}
          </button>
          {on && <CursorTrail {...p} />}
        </div>
      )}
    />
  );
}
