import { useState } from "react";
import { Silk } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function SilkDemo() {
  const [color, setColor] = useState("#3b1d8f");
  const [sheen, setSheen] = useState("#f4f4f6");
  const [folds, setFolds] = useState(1);
  const [speed, setSpeed] = useState(1);
  return (
    <div className="demo not-content">
      <Silk className="demo-stage" color={color} sheen={sheen} folds={folds} speed={speed} />
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="sheen" value={sheen} onChange={setSheen} />
        <Range label="folds" value={folds} min={0.3} max={3} step={0.1} onChange={setFolds} />
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
