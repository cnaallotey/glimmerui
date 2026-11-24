import { useState } from "react";
import { TiltCard } from "@glimmerui/react";
import { Range } from "./Range";

export function TiltCardDemo() {
  const [maxTilt, setMaxTilt] = useState(0.4);
  const [radius, setRadius] = useState(20);
  const [glare, setGlare] = useState(1);
  return (
    <div className="demo not-content">
      <div className="demo-stage demo-stage--card">
        <TiltCard
          src="/demo.png"
          alt="Test pattern of a grid and rings"
          maxTilt={maxTilt}
          radius={radius}
          glare={glare}
          style={{ width: "min(100%, 30rem)", aspectRatio: "3 / 2" }}
        />
      </div>
      <div className="demo-controls">
        <Range label="maxTilt" value={maxTilt} min={0} max={0.8} step={0.05} onChange={setMaxTilt} />
        <Range label="radius" value={radius} min={0} max={48} step={1} onChange={setRadius} />
        <Range label="glare" value={glare} min={0} max={1} step={0.05} onChange={setGlare} />
      </div>
    </div>
  );
}
