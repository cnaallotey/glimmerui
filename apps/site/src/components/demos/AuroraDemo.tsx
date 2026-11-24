import { useState } from "react";
import { Aurora } from "@glimmerui/react";
import { Range } from "./Range";

type Palette = [string, string, string];

export function AuroraDemo() {
  const [colors, setColors] = useState<Palette>(["#2dd4bf", "#a3e635", "#a855f7"]);
  const [background, setBackground] = useState("#0b1026");
  const [speed, setSpeed] = useState(1);

  const setColor = (i: number, value: string) =>
    setColors((c) => c.map((v, j) => (j === i ? value : v)) as Palette);

  return (
    <div className="demo not-content">
      <Aurora className="demo-stage" colors={colors} background={background} speed={speed} />
      <div className="demo-controls">
        {colors.map((color, i) => (
          <label key={i}>
            Color {i + 1}
            <input type="color" value={color} onChange={(e) => setColor(i, e.target.value)} />
          </label>
        ))}
        <label>
          background
          <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
        </label>
        <Range label="speed" value={speed} min={0} max={3} step={0.1} onChange={setSpeed} />
      </div>
    </div>
  );
}
