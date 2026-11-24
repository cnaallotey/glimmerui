import { useState } from "react";
import { HoloCard } from "@glimmerui/react";
import { Range } from "./Range";

export function HoloCardDemo() {
  const [foil, setFoil] = useState(0.8);
  const [maxTilt, setMaxTilt] = useState(0.4);
  const [radius, setRadius] = useState(20);
  return (
    <div className="demo not-content">
      <div className="demo-stage demo-stage--card">
        <HoloCard
          src="/demo-spheres.png"
          alt="Four glossy colored spheres on a holographic card"
          foil={foil}
          maxTilt={maxTilt}
          radius={radius}
          style={{ width: "min(100%, 30rem)", aspectRatio: "3 / 2" }}
        />
      </div>
      <div className="demo-controls">
        <Range label="foil" value={foil} min={0} max={1} step={0.05} onChange={setFoil} />
        <Range label="maxTilt" value={maxTilt} min={0} max={0.8} step={0.05} onChange={setMaxTilt} />
        <Range label="radius" value={radius} min={0} max={48} step={1} onChange={setRadius} />
      </div>
    </div>
  );
}
