import { SpotlightCard } from "@glimmerui/react";
import { color, range } from "./controls";
import { Demo } from "./Demo";

const controls = [
  color("color", "#e0457b"),
  color("background", "#16151c"),
  range("radius", 16, 0, 40, 1),
];
const presets = {
  Pink: {},
  Cyan: { color: "#22d3ee", background: "#0b1620" },
  Paper: { color: "#3b1d8f", background: "#ffffff", radius: 28 },
};

export function SpotlightCardDemo() {
  return (
    <Demo
      name="SpotlightCard"
      controls={controls}
      presets={presets}
      children="<h3>Pro plan</h3>"
      render={(p) => (
        <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12" }}>
          <SpotlightCard {...p} style={{ width: "min(100%, 24rem)", borderRadius: p.radius, padding: "1.75rem", color: "#a3a1ad" }}>
            <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: "0.4rem" }}>Pro plan</strong>
            <span>Unlimited projects, priority support and early access to new effects.</span>
          </SpotlightCard>
        </div>
      )}
    />
  );
}
