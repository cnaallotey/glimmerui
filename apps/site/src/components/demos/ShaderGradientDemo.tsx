import { useState } from "react";
import { ShaderGradient } from "@glimmerui/react";
import { Range } from "./Range";

export function ShaderGradientDemo() {
  const [colors, setColors] = useState<[string, string, string]>([
    "#3b1d8f",
    "#e0457b",
    "#f9b44c",
  ]);
  const [speed, setSpeed] = useState(1);

  const setColor = (i: number, value: string) =>
    setColors((c) => c.map((v, j) => (j === i ? value : v)) as [string, string, string]);

  return (
    <div className="demo not-content">
      <ShaderGradient className="demo-stage" colors={colors} speed={speed} />
      <div className="demo-controls">
        {colors.map((color, i) => (
          <label key={i}>
            Color {i + 1}
            <input type="color" value={color} onChange={(e) => setColor(i, e.target.value)} />
          </label>
        ))}
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
