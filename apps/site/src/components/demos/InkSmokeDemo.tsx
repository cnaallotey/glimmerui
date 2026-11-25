import { InkSmoke } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#e9e8ee"),
  color("background", "#0e0d12"),
  range("speed", 1, 0, 3, 0.1),
];
const presets = {
  Chalk: {},
  Ink: { color: "#0e0d12", background: "#f4f1ea" },
  Incense: { color: "#f9b44c", background: "#1c0f0a", speed: 0.6 },
};

export function InkSmokeDemo() {
  return (
    <Demo
      name="InkSmoke"
      controls={controls}
      presets={presets}
      render={(p) => <InkSmoke className="demo-stage" {...p} />}
    />
  );
}
