import { useState } from "react";
import { CursorTrail } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

export function CursorTrailDemo() {
  const [on, setOn] = useState(false);
  const [color, setColor] = useState("#e0457b");
  const [tail, setTail] = useState("#f9b44c");
  const [width, setWidth] = useState(10);
  const [length, setLength] = useState(20);
  return (
    <div className="demo not-content">
      <div className="demo-stage demo-stage--card">
        <button type="button" className="demo-toggle" aria-pressed={on} onClick={() => setOn(!on)}>
          {on ? "Turn the trail off" : "Turn the trail on"}
        </button>
        {on && <CursorTrail color={color} tail={tail} width={width} length={length} />}
      </div>
      <div className="demo-controls">
        <ColorInput label="color" value={color} onChange={setColor} />
        <ColorInput label="tail" value={tail} onChange={setTail} />
        <Range label="width" value={width} min={2} max={30} step={1} onChange={setWidth} />
        <Range label="length" value={length} min={4} max={40} step={1} onChange={setLength} />
      </div>
    </div>
  );
}
