import { ContourLines } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#8b8a94"),
  color("accent", "#e0457b"),
  range("density", 12, 3, 30, 1),
  range("width", 1, 0.5, 3, 0.25),
];
const presets = {
  Pencil: {},
  Dense: { density: 22, width: 0.75 },
  Survey: { color: "#b45309", accent: "#15803d", density: 9, width: 1.5 },
};

export function ContourLinesDemo() {
  return (
    <Demo
      name="ContourLines"
      controls={controls}
      presets={presets}
      render={(p) => <ContourLines className="demo-stage" style={{ background: "var(--sl-color-black)" }} {...p} />}
    />
  );
}
