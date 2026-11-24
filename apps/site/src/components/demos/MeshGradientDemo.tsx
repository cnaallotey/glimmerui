import { useState } from "react";
import { MeshGradient } from "@glimmerui/react";
import { ColorInput } from "./ColorInput";
import { Range } from "./Range";

type Palette = [string, string, string, string];

export function MeshGradientDemo() {
  const [colors, setColors] = useState<Palette>(["#3b1d8f", "#e0457b", "#f9b44c", "#22d3ee"]);
  const [grain, setGrain] = useState(0.5);
  const [speed, setSpeed] = useState(1);
  const setColor = (i: number, value: string) =>
    setColors((c) => c.map((v, j) => (j === i ? value : v)) as Palette);
  return (
    <div className="demo not-content">
      <MeshGradient className="demo-stage" colors={colors} grain={grain} speed={speed} />
      <div className="demo-controls">
        {colors.map((color, i) => (
          <ColorInput key={i} label={`Color ${i + 1}`} value={color} onChange={(v) => setColor(i, v)} />
        ))}
        <Range label="grain" value={grain} min={0} max={1} step={0.05} onChange={setGrain} />
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
