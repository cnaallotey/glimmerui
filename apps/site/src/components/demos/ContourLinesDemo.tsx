import { useState } from "react";
import { ContourLines } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function ContourLinesDemo() {
  const [color, setColor] = useState("#8b8a94");
  const [accent, setAccent] = useState("#e0457b");
  const [density, setDensity] = useState(12);
  const [width, setWidth] = useState(1);
  return (
    <div className="demo not-content">
      <ContourLines
        className="demo-stage"
        style={{ background: "var(--sl-color-black)" }}
        color={color}
        accent={accent}
        density={density}
        width={width}
      />
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="accent" value={accent} onChange={setAccent} />
        <Range label="density" value={density} min={3} max={30} step={1} onChange={setDensity} />
        <Range label="width" value={width} min={0.5} max={3} step={0.25} onChange={setWidth} />
      </div>
    </div>
  );
}
