import { useState } from "react";
import { Starfield } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function StarfieldDemo() {
  const [color, setColor] = useState("#ffffff");
  const [background, setBackground] = useState("#05040a");
  const [density, setDensity] = useState(1);
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <Starfield className="demo-stage" color={color} background={background} density={density} speed={speed} />
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="background" value={background} onChange={setBackground} />
        <Range label="density" value={density} min={0.3} max={3} step={0.1} onChange={setDensity} />
        <Range label="speed" value={speed} min={0} max={4} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
