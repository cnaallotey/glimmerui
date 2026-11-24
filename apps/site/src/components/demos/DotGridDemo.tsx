import { useState } from "react";
import { DotGrid } from "@glimmerui/react";
import { Range } from "./Range";

export function DotGridDemo() {
  const [color, setColor] = useState("#8f8bab");
  const [accent, setAccent] = useState("#e0457b");
  const [spacing, setSpacing] = useState(24);
  const [size, setSize] = useState(1.5);
  const [radius, setRadius] = useState(140);
  return (
    <div className="demo not-content">
      <DotGrid
        className="demo-stage"
        color={color}
        accent={accent}
        spacing={spacing}
        size={size}
        radius={radius}
      />
      <div className="demo-controls">
        <label>
          color
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          accent
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </label>
        <Range label="spacing" value={spacing} min={10} max={48} step={1} onChange={setSpacing} />
        <Range label="size" value={size} min={0.5} max={5} step={0.25} onChange={setSize} />
        <Range label="radius" value={radius} min={40} max={320} step={10} onChange={setRadius} />
      </div>
    </div>
  );
}
