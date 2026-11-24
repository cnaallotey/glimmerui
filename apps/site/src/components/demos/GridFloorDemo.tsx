import { useState } from "react";
import { GridFloor } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function GridFloorDemo() {
  const [color, setColor] = useState("#e0457b");
  const [glow, setGlow] = useState("#f9b44c");
  const [background, setBackground] = useState("#0e0d12");
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <GridFloor className="demo-stage" color={color} glow={glow} background={background} speed={speed} />
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="glow" value={glow} onChange={setGlow} />
        <ColorInput label="background" value={background} onChange={setBackground} />
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
