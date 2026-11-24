import { useState } from "react";
import { SpotlightCard } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function SpotlightCardDemo() {
  const [color, setColor] = useState("#e0457b");
  const [background, setBackground] = useState("#16151c");
  const [radius, setRadius] = useState(16);
  return (
    <div className="demo not-content">
      <div className="demo-stage demo-stage--card" style={{ background: "#0e0d12" }}>
        <SpotlightCard
          color={color}
          background={background}
          radius={radius}
          style={{ width: "min(100%, 24rem)", borderRadius: radius, padding: "1.75rem", color: "#e9e8ee" }}
        >
          <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: "0.4rem" }}>Pro plan</strong>
          <span style={{ color: "#a3a1ad" }}>Unlimited projects, priority support and early access to new effects.</span>
        </SpotlightCard>
      </div>
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="background" value={background} onChange={setBackground} />
        <Range label="radius" value={radius} min={0} max={40} step={1} onChange={setRadius} />
      </div>
    </div>
  );
}
