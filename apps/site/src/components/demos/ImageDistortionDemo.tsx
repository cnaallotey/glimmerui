import { useState } from "react";
import { ImageDistortion } from "@glimmerui/react";
import { Range } from "./Range";

export function ImageDistortionDemo() {
  const [strength, setStrength] = useState(1);
  return (
    <div className="demo not-content">
      <ImageDistortion
        className="demo-stage"
        src="/demo.png"
        alt="Test pattern of a grid and rings"
        strength={strength}
      />
      <div className="demo-controls">
        <Range label="strength" value={strength} min={0} max={2} step={0.1} onChange={setStrength} />
      </div>
    </div>
  );
}
