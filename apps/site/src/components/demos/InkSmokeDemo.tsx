import { useState } from "react";
import { InkSmoke } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function InkSmokeDemo() {
  const [color, setColor] = useState("#e9e8ee");
  const [background, setBackground] = useState("#0e0d12");
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <InkSmoke className="demo-stage" color={color} background={background} speed={speed} />
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="background" value={background} onChange={setBackground} />
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
