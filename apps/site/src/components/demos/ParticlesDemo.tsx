import { useState } from "react";
import { Particles } from "@glimmerui/react";
import { Range } from "./Range";

export function ParticlesDemo() {
  const [count, setCount] = useState(2500);
  const [color, setColor] = useState("#8b8a94");
  const [accent, setAccent] = useState("#e0457b");
  const [size, setSize] = useState(2);
  const [radius, setRadius] = useState(160);
  return (
    <div className="demo not-content">
      <Particles
        className="demo-stage"
        count={count}
        color={color}
        accent={accent}
        size={size}
        radius={radius}
      />
      <div className="demo-controls">
        <Range label="count" value={count} min={250} max={10000} step={250} onChange={setCount} />
        <label>
          color
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          accent
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </label>
        <Range label="size" value={size} min={1} max={6} step={0.25} onChange={setSize} />
        <Range label="radius" value={radius} min={40} max={400} step={10} onChange={setRadius} />
      </div>
    </div>
  );
}
