import { BorderBeam } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#f9b44c"),
  color("tail", "#e0457b"),
  color("background", "#16151c"),
  range("radius", 16, 0, 40, 1),
  range("border", 1.5, 0.5, 5, 0.5),
  range("length", 0.3, 0.05, 1, 0.05),
  range("beams", 1, 1, 4, 1),
  range("speed", 1, -3, 3, 0.1),
];
const presets = {
  Sunset: {},
  Twin: { beams: 2, length: 0.35, color: "#22d3ee", tail: "#3b82f6" },
  Paper: { background: "#ffffff", color: "#e0457b", tail: "#f9b44c", border: 2.5 },
};

export function BorderBeamDemo() {
  return (
    <Demo
      name="BorderBeam"
      controls={controls}
      presets={presets}
      children="<h3>Deploying</h3>"
      render={(p) => (
        <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12" }}>
          <BorderBeam {...p} style={{ width: "min(100%, 24rem)", borderRadius: p.radius, padding: "1.75rem", color: "#a3a1ad" }}>
            <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: "0.4rem" }}>Deploying</strong>
            <span>Building your site. This usually takes under a minute.</span>
          </BorderBeam>
        </div>
      )}
    />
  );
}
