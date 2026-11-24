import { useState } from "react";
import { GlitchImage } from "@glimmerui/react";
import { Range } from "./Range";

export function GlitchImageDemo() {
  const [strength, setStrength] = useState(1);
  return (
    <div className="demo not-content">
      <GlitchImage
        className="demo-stage"
        src="/demo-spheres.png"
        alt="Four glossy colored spheres on a studio floor"
        strength={strength}
      />
      <div className="demo-controls">
        <Range label="strength" value={strength} min={0} max={2} step={0.1} onChange={setStrength} />
      </div>
    </div>
  );
}
